import { number, z } from "zod";
import { db, dbSchema } from "../../db"
import { adminProcedure, authProcedure, publicProcedure, router } from "../trpc";
import { eq, desc, sql, inArray, and, or, ilike } from "drizzle-orm"
import axios from 'axios';
import { TRPCError } from "@trpc/server";
import { getCookieHelper } from "../cookieHelper"
import { auth } from "../../auth"
import { ee } from "../../events/events"
import { geocodeLocation } from "./surveillance";

const citationCache = new Map<string, { count: number, expires: number }>();

export type LocationJSON = {
    city: string;
    country: string;
    state: string;
    lat: number;
    lng: number;
};

function parseLocation(value: unknown): LocationJSON | null {
    if (!value) return null;

    if (typeof value === "object") {
        return value as LocationJSON;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);

            if (typeof parsed === "string") {
                return JSON.parse(parsed) as LocationJSON;
            }

            return parsed as LocationJSON;
        } catch {
            return null;
        }
    }

    return null;
}

function extractRepoInfo(githubUrl: string) {
    if (!githubUrl || !githubUrl.includes('github.com')) {
        return null;
    }

    const urlParts = githubUrl.replace(/https?:\/\/|www\.|\.git$/g, '').split('/');

    const githubIndex = urlParts.findIndex(part => part === 'github.com');

    if (githubIndex === -1 || githubIndex + 2 >= urlParts.length) {
        return null;
    }

    const owner = urlParts[githubIndex + 1];
    const repo = urlParts[githubIndex + 2];

    return { owner, repo };
}

async function fetchGitHubStars(githubUrl: string) {
    try {
        const repoInfo = extractRepoInfo(githubUrl);
        if (!repoInfo) return null;

        const { owner, repo } = repoInfo;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

        const response = await axios.get(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Bioinfo-Tools-API'
            }
        });

        return response.data.stargazers_count;
    } catch (error) {
        return null;
    }
}

async function fetchCitationsFromSemanticScholar(doi: string | null | undefined) {
    if (!doi) {
        return 0;
    }

    const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/DOI:${doi}?fields=title,authors,citationCount`);

    if (!response.ok) {
        if (response.status === 404) {
            return 0;
        }
        throw new Error(`Failed to fetch data from Semantic Scholar: ${response.statusText}`);
    }

    const data = await response.json() as { citationCount: number };
    return data.citationCount;
}

export const bioinfoRouter = router({
    getTools: publicProcedure
        .input(
            z.object({
                limit: z.number().max(50).default(10),
                page: z.number().default(1),
                offset: z.number().default(0),
                searchQuery: z.string().optional(),
                pathogens: z.array(z.string()).optional(),
                tags: z.array(z.string()).optional(),
                sortBy: z.enum(["rating", "citations", "recent"]).optional().default("recent"),
                database: z.enum(["yes", "no"]),
            }),
        )
        .query(async ({ ctx, input }) => {
            const token = getCookieHelper(ctx.req, auth.sessionCookieName ?? '') ?? '';
            const session = await auth.validateSessionToken(token);

            let whereConditions = [
                eq(dbSchema.Tool.status, 'active'),
                eq(dbSchema.Tool.database, input.database)
            ];

            if (input.searchQuery) {
                whereConditions.push(or(
                    ilike(dbSchema.Tool.tool, `%${input.searchQuery}%`),
                    ilike(dbSchema.Tool.description, `%${input.searchQuery}%`)
                ) as any);
            }

            if (input.pathogens?.length) {
                const pathogenSubquery = db
                    .select({ idTool: dbSchema.ToolPathogen.idTool })
                    .from(dbSchema.ToolPathogen)
                    .innerJoin(dbSchema.Pathogen, eq(dbSchema.Pathogen.id, dbSchema.ToolPathogen.idPathogen))
                    .where(inArray(dbSchema.Pathogen.pathogen, input.pathogens));
                whereConditions.push(inArray(dbSchema.Tool.id, pathogenSubquery));
            }

            if (input.tags?.length) {
                for (const tag of input.tags) {
                    const tagSubquery = db
                        .select({ idTool: dbSchema.ToolTag.idTool })
                        .from(dbSchema.ToolTag)
                        .innerJoin(dbSchema.Tag, eq(dbSchema.Tag.id, dbSchema.ToolTag.idTag))
                        .where(eq(dbSchema.Tag.tag, tag));
                    whereConditions.push(inArray(dbSchema.Tool.id, tagSubquery));
                }
            }

            const avgRatingSubquery = db
                .select({
                    toolId: dbSchema.ToolRating.idTool,
                    avgRating: sql<number>`AVG(${dbSchema.ToolRating.rating})`.as('avg_rating')
                })
                .from(dbSchema.ToolRating)
                .groupBy(dbSchema.ToolRating.idTool)
                .as('avg_ratings');

            const baseQuery = db
                .select({
                    tool: dbSchema.Tool,
                    avgRating: sql<number>`COALESCE(${avgRatingSubquery.avgRating}, 0)`,
                    user: dbSchema.User,
                })
                .from(dbSchema.Tool)
                .leftJoin(avgRatingSubquery, eq(dbSchema.Tool.id, avgRatingSubquery.toolId))
                .leftJoin(dbSchema.User, eq(dbSchema.Tool.idUser, dbSchema.User.id))
                .where(and(...whereConditions));

            let orderBy;
            switch (input.sortBy) {
                case "rating":
                    orderBy = desc(sql`avg_rating`);
                    break;
                case "citations":
                    orderBy = desc(dbSchema.Tool.doi);
                    break;
                case "recent":
                default:
                    orderBy = desc(dbSchema.Tool.update);
            }

            const toolsRawResult = await baseQuery
                .orderBy(orderBy)
                .limit(input.limit)
                .offset((input.page - 1) * input.limit + input.offset);

            const toolsRaw = toolsRawResult.map(({ tool, user }) => ({ ...tool, createdBy: user?.name + ' ' + user?.lastName }));

            const totalCountRes = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.Tool).where(and(...whereConditions));
            const toolsId = toolsRaw.map(tool => tool.id);

            const ratings =
                toolsId.length > 0
                    ? await db
                        .select({
                            toolId: dbSchema.ToolRating.idTool,
                            rating: sql<number>`AVG(${dbSchema.ToolRating.rating})`,
                        })
                        .from(dbSchema.ToolRating)
                        .where(
                            inArray(
                                dbSchema.ToolRating.idTool,
                                toolsId
                            )
                        )
                        .groupBy(dbSchema.ToolRating.idTool)
                    : [];

            const ratingByTool = Object.fromEntries(
                ratings.map((r) => [
                    r.toolId,
                    Number(r.rating),
                ])
            );

            const usageCounts = toolsId.length
                ? await db
                    .select({
                        toolId:
                            dbSchema.ToolUser.idTool,
                        count: sql<number>`count(*)`,
                    })
                    .from(dbSchema.ToolUser)
                    .where(
                        inArray(
                            dbSchema.ToolUser.idTool,
                            toolsId
                        )
                    )
                    .groupBy(
                        dbSchema.ToolUser.idTool
                    )
                : [];

            const usageCountByTool = Object.fromEntries(
                usageCounts.map((u) => [
                    u.toolId,
                    u.count,
                ])
            );

            const toolsUsers = toolsId.length
                ? await db
                    .select()
                    .from(dbSchema.ToolUser)
                    .where(
                        inArray(
                            dbSchema.ToolUser.idTool,
                            toolsId
                        )
                    )
                : [];

            const toolsUsersMap = new Map<number, any[]>();
            toolsUsers.forEach((user) => {
                if (user.idTool !== null) {
                    if (!toolsUsersMap.has(user.idTool)) {
                        toolsUsersMap.set(user.idTool, []);
                    }
                    toolsUsersMap.get(user.idTool)?.push(user);
                }
            });

            const toolsWithStars = await Promise.all(
                toolsRaw.map(async (tool) => {
                    let citations = 0;
                    if (tool.doi) {
                        const cached = citationCache.get(tool.doi);
                        if (cached && cached.expires > Date.now()) {
                            citations = cached.count;
                        } else {
                            citations = await fetchCitationsFromSemanticScholar(tool.doi);
                            citationCache.set(tool.doi, { count: citations, expires: Date.now() + 3600000 }); // 1h cache
                        }
                    }
                    return {
                        ...tool,
                        type: tool.database === "yes" ? "database" : "tool",
                        tags: (await db.select({ tag: dbSchema.Tag.tag }).from(dbSchema.ToolTag).innerJoin(dbSchema.Tag, eq(dbSchema.Tag.id, dbSchema.ToolTag.idTag)).where(eq(dbSchema.ToolTag.idTool, tool.id))).map(t => t.tag),
                        citations: await fetchCitationsFromSemanticScholar(tool.doi),
                        githubStars: tool.github ? await fetchGitHubStars(tool.github) : null,
                        pathogens: (await db.select({ p: dbSchema.Pathogen.pathogen }).from(dbSchema.ToolPathogen).innerJoin(dbSchema.Pathogen, eq(dbSchema.Pathogen.id, dbSchema.ToolPathogen.idPathogen)).where(eq(dbSchema.ToolPathogen.idTool, tool.id))).map(p => p.p),
                        usedBy: toolsUsersMap.get(tool.id) ?? [],
                        usageCount: usageCountByTool[tool.id] ?? 0,
                        rating: ratingByTool[tool.id] ?? 0,
                        totalRatings: ratings.length,
                        createdBy: tool.createdBy,
                    };
                })
            );

            const totalCount = toolsWithStars.length;
            const offset = (input.page - 1) * input.limit + input.offset;
            const paginatedTools = toolsWithStars.slice(offset, offset + input.limit);

            return {
                ok: true,
                currentPage: input.page,
                totalPages: Math.ceil(totalCount / input.limit),
                tools: paginatedTools,
                totalCount,
            };

        }),

    sugestionTools: authProcedure
        .input(z.object({
            tool: z.string(),
            description: z.string(),
            article: z.string(),
            articleLink: z.string(),
            contact: z.string(),
            website: z.string(),
            github: z.string(),
            tutorial: z.string(),
            update: z.string(),
            documentation: z.string(),
            development: z.string(),
            type: z.enum(["analysis", "visualization", "prediction", "other"]),
            tags: z.array(z.string())
        }))
        .mutation(async ({ ctx, input }) => {
            const [{ insertId }] = await db.insert(dbSchema.Tool).values({
                tool: input.tool,
                status: "waiting",
                description: input.description,
                article: input.article,
                articleLink: input.articleLink,
                type: input.type,
                contact: input.contact,
                website: input.website,
                github: input.github,
                tutorial: input.tutorial,
                update: new Date(input.update),
                documentation: input.documentation,
                development: input.development,
                idUser: ctx.user.id
            })
            const insertIdTool = insertId
            for (const tag of input.tags) {
                const existTag = await db.select()
                    .from(dbSchema.Tag).where(eq(dbSchema.Tag.tag, tag))
                    .orderBy(desc(dbSchema.Tag.createdAt))
                    .limit(1)
                if (existTag.length === 0) {
                    const [{ insertId }] = await db.insert(dbSchema.Tag).values({
                        tag: tag
                    })
                    await db.insert(dbSchema.ToolTag).values({
                        idTool: insertIdTool,
                        idTag: insertId
                    })
                }
                else {
                    await db.insert(dbSchema.ToolTag).values({
                        idTool: insertIdTool,
                        idTag: existTag[0].id
                    })
                }
            }
            return {
                ok: true,
            }
        }),
    getSuggestionTools: adminProcedure
        .query(async ({ ctx }) => {
            const tools = await db.select()
                .from(dbSchema.Tool)
                .leftJoin(dbSchema.ToolTag, eq(dbSchema.Tool.id, dbSchema.ToolTag.idTool))
                .leftJoin(dbSchema.Tag, eq(dbSchema.ToolTag.idTag, dbSchema.Tag.id))
                .leftJoin(dbSchema.CommentTool, eq(dbSchema.Tool.id, dbSchema.CommentTool.idTool))
                .where(eq(dbSchema.Tool.status, "waiting"))

            return {
                ok: true,
                tools: tools
            }
        }),
    approveSuggestionTool: adminProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            await db.update(dbSchema.Tool).set({
                status: "active"
            }).where(eq(dbSchema.Tool.id, input.id))

            return {
                ok: true,
            }
        }),
    rejectSuggestionTool: adminProcedure
        .input(z.object({
            id: z.number()
        }))
        .mutation(async ({ ctx, input }) => {
            await db.update(dbSchema.Tool).set({
                status: "inactive"
            }).where(eq(dbSchema.Tool.id, input.id))

            return {
                ok: true,
            }
        }),
    commentTool: authProcedure
        .input(z.object({
            idTool: z.number(),
            comment: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const [{ insertId }] = await db.insert(dbSchema.CommentTool).values({
                idUser: ctx.user.id,
                idTool: input.idTool,
                comment: input.comment
            })
            return {
                ok: true,
                id: insertId
            }
        }),
    removeStarFromTool: authProcedure
        .input(
            z.object({
                idTool: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const existingStar = await db
                .select()
                .from(dbSchema.StarTool)
                .where(
                    and(
                        eq(dbSchema.StarTool.idUser, ctx.user.id),
                        eq(dbSchema.StarTool.idTool, input.idTool)
                    )
                )
                .limit(1);

            if (existingStar.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Avaliação não encontrada. Use o método de criação.',
                });
            }

            await db
                .delete(dbSchema.StarTool)
                .where(
                    and(
                        eq(dbSchema.StarTool.idUser, ctx.user.id),
                        eq(dbSchema.StarTool.idTool, input.idTool)
                    )
                );

            return {
                ok: true,
                message: 'Avaliação removida com sucesso',
            };
        }),

    upsertStarTool: authProcedure
        .input(
            z.object({
                idTool: z.number(),
                number: z.number().min(1).max(5),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const tool = await db
                .select()
                .from(dbSchema.Tool)
                .where(
                    and(
                        eq(dbSchema.Tool.id, input.idTool),
                        eq(dbSchema.Tool.status, "active")
                    )
                )
                .limit(1);

            if (tool.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Ferramenta não encontrada',
                });
            }

            const existingStar = await db
                .select()
                .from(dbSchema.StarTool)
                .where(
                    and(
                        eq(dbSchema.StarTool.idUser, ctx.user.id),
                        eq(dbSchema.StarTool.idTool, input.idTool)
                    )
                )
                .limit(1);

            let result;
            let action;

            if (existingStar.length > 0) {
                [result] = await db
                    .update(dbSchema.StarTool)
                    .set({
                        number: input.number,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(dbSchema.StarTool.idUser, ctx.user.id),
                            eq(dbSchema.StarTool.idTool, input.idTool)
                        )
                    )
                action = 'updated';
            } else {
                [result] = await db
                    .insert(dbSchema.StarTool)
                    .values({
                        idUser: ctx.user.id,
                        idTool: input.idTool,
                        number: input.number,
                    })
                action = 'created';
            }

            return {
                ok: true,
                message: `Avaliação ${action === 'created' ? 'adicionada' : 'atualizada'} com sucesso`,
                star: result,
                action,
            };
        }),
    getPopularTags: publicProcedure
        .query(async () => {
            const tags = await db
                .select({
                    tag: dbSchema.Tag.tag,
                    count: sql<number>`count(*)`,
                    id: dbSchema.Tag.id,
                })
                .from(dbSchema.ToolTag)
                .innerJoin(dbSchema.Tag, eq(dbSchema.ToolTag.idTag, dbSchema.Tag.id))
                .groupBy(dbSchema.Tag.tag, dbSchema.Tag.id)
                .orderBy(desc(sql<number>`count(*)`))
                .limit(6);

            return {
                ok: true,
                tags: tags
            }
        }),
    getPathogens: publicProcedure
        .query(async () => {
            const pathogens = await db
                .select({
                    pathogen: dbSchema.Pathogen.pathogen,
                    count: sql<number>`count(*)`,
                })
                .from(dbSchema.ToolPathogen)
                .innerJoin(dbSchema.Pathogen, eq(dbSchema.ToolPathogen.idPathogen, dbSchema.Pathogen.id))
                .groupBy(dbSchema.Pathogen.pathogen)
                .orderBy(desc(sql<number>`count(*)`))
                .limit(6);

            return {
                ok: true,
                pathogens: pathogens
            }
        }),
    saveForumPost: authProcedure.input(
        z.object({
            title: z.string(),
            message: z.string(),
            tags: z.string(),
            related: z.number().optional(),
            type: z.enum(["workflow", "usecase", "tool", "database"]).optional(),
        }),
    ).mutation(async ({ input, ctx }) => {
        let insertId: number;

        if (input.type === "workflow") {
            [{ insertId }] = await db.insert(dbSchema.Question).values({
                idUser: ctx.user.id,
                question: input.title,
                description: input.message,
                resolved: "no",
                relatedWorkflow: input.related,
                type: "general",
            });
        }
        else if (input.type === "usecase") {
            [{ insertId }] = await db.insert(dbSchema.Question).values({
                idUser: ctx.user.id,
                question: input.title,
                description: input.message,
                resolved: "no",
                relatedUseCase: input.related,
                type: "general",
            });
        }
        else if (input.type === "tool" || input.type === "database") {
            [{ insertId }] = await db.insert(dbSchema.Question).values({
                idUser: ctx.user.id,
                question: input.title,
                description: input.message,
                resolved: "no",
                relatedTool: input.related,
                type: "general",
            });
        }
        else {
            throw new Error("Invalid forum post type");
        }
        const tagsArray = input.tags.split(",");
        const insertedTagIds: number[] = [];

        for (const tag of tagsArray) {
            const existTag = await db.select().from(dbSchema.Tag).where(eq(dbSchema.Tag.tag, tag)).limit(1).then((res) => res[0])
            if (!existTag) {
                const [{ insertId }] = await db.insert(dbSchema.Tag).values({ tag });
                insertedTagIds.push(insertId);
            }
            else {
                insertedTagIds.push(existTag.id)
            }
        }

        await db.insert(dbSchema.QuestionTag).values(
            insertedTagIds.map((idTag) => ({
                idQuestion: insertId,
                idTag,
            }))
        );

        return { id: insertId }
    }),
    addTool: authProcedure
        .input(
            z.object({
                tool: z.string(),
                description: z.string(),
                website: z.string(),
                github: z.string(),
                contact: z.string(),
                isDeveloper: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const [{ insertId }] = await db.insert(dbSchema.SuggestionTool).values({
                tool: input.tool,
                description: input.description,
                website: input.website,
                github: input.github,
                contact: input.contact,
                isDeveloper: input.isDeveloper,
            })

            const replacements = {
                tool: input.tool,
                description: input.description,
                website: input.website,
                github: input.github,
                contact: input.contact,
                isDeveloper: input.isDeveloper === "true" ? "Sim" : "Não",
            }

            ee.emit("sendEmail", {
                email: "resistohub@ufcspa.edu.br",
                subject: "Nova Sugestão de Ferramenta",
                fileName: "toolSuggestion",
                replacements: replacements,
            })

            return {
                ok: true,
            }
        }),
    saveWorkflow: authProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                toolSequence: z.array(z.object({
                    toolId: z.number(),
                    order: z.number(),
                })),
                difficulty: z.enum(["beginner", "intermediate", "advanced"]),
                tags: z.array(z.string()),
                pipelineCode: z.string().optional(),
                pipelineGitLink: z.string().optional(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const pipeline = {
                pipelineCode: input.pipelineCode || null,
                pipelineGitLink: input.pipelineGitLink || null
            };

            const [{ insertId }] = await db.insert(dbSchema.Workflow).values({
                name: input.name,
                description: input.description,
                toolSequence: input.toolSequence,
                difficulty: input.difficulty,
                idUser: ctx.user.id,
                pipeline: pipeline,
            });


            const insertedTagIds: number[] = [];

            for (const tag of input.tags) {
                const existTag = await db
                    .select()
                    .from(dbSchema.Tag)
                    .where(eq(dbSchema.Tag.tag, tag))
                    .limit(1)
                    .then((res) => res[0]);

                if (!existTag) {
                    const [{ insertId: tagId }] = await db
                        .insert(dbSchema.Tag)
                        .values({ tag, createdAt: new Date() });
                    insertedTagIds.push(tagId);
                } else {
                    insertedTagIds.push(existTag.id);
                }
            }

            if (insertedTagIds.length > 0) {
                await db.insert(dbSchema.WorkflowTag).values(
                    insertedTagIds.map((idTag) => ({
                        idWorkflow: insertId,
                        idTag,
                    }))
                );
            }

            return {
                ok: true,
            }
        }),
    saveUseCase: authProcedure
        .input(
            z.object({
                name: z.string(),
                description: z.string(),
                selectedTools: z.array(z.number()),
                difficulty: z.enum(["beginner", "intermediate", "advanced"]),
                steps: z.array(z.string()),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const stepByStepGuide = input.steps.join("\n");
            const selectedTools = JSON.stringify(input.selectedTools);
            const [{ insertId }] = await db.insert(dbSchema.UseCase).values({
                title: input.name,
                description: input.description,
                difficulty: input.difficulty,
                idUser: ctx.user.id,
                recommendedTools: selectedTools,
                stepByStepGuide: stepByStepGuide,
            })

            return {
                ok: true,
            }
        }),
    getWorkflows: publicProcedure
        .input(
            z.object({
                limit: z.number().max(50).default(10),
                page: z.number().default(1),
                offset: z.number().default(0),
                searchQuery: z.string().optional(),
                filters: z
                    .object({
                        tags: z.array(z.string()).optional(),
                        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
                        sortBy: z
                            .enum(["rating", "citations", "recent", "usage"])
                            .optional()
                            .default("recent"),
                    })
                    .optional()
                    .default({}),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                const token =
                    getCookieHelper(ctx.req, auth.sessionCookieName ?? "") ?? "";
                await auth.validateSessionToken(token);

                const conditions: any[] = [];

                if (input.searchQuery?.trim()) {
                    conditions.push(
                        or(
                            ilike(
                                dbSchema.Workflow.name,
                                `%${input.searchQuery}%`
                            ),
                            ilike(
                                dbSchema.Workflow.description,
                                `%${input.searchQuery}%`
                            )
                        )
                    );
                }

                if (input.filters?.difficulty) {
                    conditions.push(
                        eq(
                            dbSchema.Workflow.difficulty,
                            input.filters.difficulty
                        )
                    );
                }

                if (input.filters?.tags?.length) {
                    const workflowsWithTags = await db
                        .selectDistinct({ id: dbSchema.Workflow.id })
                        .from(dbSchema.Workflow)
                        .innerJoin(
                            dbSchema.WorkflowTag,
                            eq(
                                dbSchema.Workflow.id,
                                dbSchema.WorkflowTag.idWorkflow
                            )
                        )
                        .innerJoin(
                            dbSchema.Tag,
                            eq(dbSchema.WorkflowTag.idTag, dbSchema.Tag.id)
                        )
                        .where(
                            inArray(dbSchema.Tag.tag, input.filters.tags)
                        );

                    const ids = workflowsWithTags.map((w) => w.id);

                    if (!ids.length) {
                        return {
                            ok: true,
                            workflows: [],
                            total: 0,
                            hasMore: false,
                            currentPage: input.page,
                            totalPages: 0,
                        };
                    }

                    conditions.push(inArray(dbSchema.Workflow.id, ids));
                }

                const avgRatingSubquery = db
                    .select({
                        workflowId: dbSchema.WorkflowRating.idWorkflow,
                        avgRating: sql<number>`AVG(${dbSchema.WorkflowRating.rating})`.as('avg_rating')
                    })
                    .from(dbSchema.WorkflowRating)
                    .groupBy(dbSchema.WorkflowRating.idWorkflow)
                    .as('avg_ratings');

                let orderBy;
                switch (input.filters?.sortBy) {
                    case "rating":
                        orderBy = desc(sql`avg_rating`);
                        break;
                    case "usage":
                        orderBy = desc(dbSchema.Workflow.createdAt);
                        break;
                    case "recent":
                    default:
                        orderBy = desc(dbSchema.Workflow.createdAt);
                }

                const workflows = await db
                    .select({
                        workflow: dbSchema.Workflow,
                        user: dbSchema.User,
                        avgRating: sql<number>`COALESCE(${avgRatingSubquery.avgRating}, 0)`
                    })
                    .from(dbSchema.Workflow)
                    .leftJoin(dbSchema.User, eq(dbSchema.Workflow.idUser, dbSchema.User.id))
                    .leftJoin(avgRatingSubquery, eq(dbSchema.Workflow.id, avgRatingSubquery.workflowId))
                    .where(
                        conditions.length ? and(...conditions) : undefined
                    )
                    .orderBy(orderBy)
                    .limit(input.limit)
                    .offset(
                        (input.page - 1) * input.limit + input.offset
                    );

                const workflowIds = workflows.map(
                    (w) => w.workflow.id
                );

                const tagsResult = workflowIds.length
                    ? await db
                        .select({
                            workflowId:
                                dbSchema.WorkflowTag.idWorkflow,
                            id: dbSchema.Tag.id,
                            tag: dbSchema.Tag.tag,
                            createdAt: dbSchema.Tag.createdAt,
                        })
                        .from(dbSchema.WorkflowTag)
                        .innerJoin(
                            dbSchema.Tag,
                            eq(
                                dbSchema.WorkflowTag.idTag,
                                dbSchema.Tag.id
                            )
                        )
                        .where(
                            inArray(
                                dbSchema.WorkflowTag.idWorkflow,
                                workflowIds
                            )
                        )
                        .orderBy(
                            desc(dbSchema.Tag.createdAt)
                        )
                    : [];

                const tagsByWorkflow = tagsResult.reduce<Record<number, string[]>>((acc, t) => {
                    const workflowId = t.workflowId ?? 0;
                    acc[workflowId] ??= [];
                    if (acc[workflowId].length < 7 && t.tag !== null) {
                        acc[workflowId].push(t.tag);
                    }
                    return acc;
                }, {});

                const usageCounts = workflowIds.length
                    ? await db
                        .select({
                            workflowId:
                                dbSchema.WorkflowUser.idWorkflow,
                            count: sql<number>`count(*)`,
                        })
                        .from(dbSchema.WorkflowUser)
                        .where(
                            inArray(
                                dbSchema.WorkflowUser.idWorkflow,
                                workflowIds
                            )
                        )
                        .groupBy(
                            dbSchema.WorkflowUser.idWorkflow
                        )
                    : [];

                const usageCountByWorkflow = Object.fromEntries(
                    usageCounts.map((u) => [
                        u.workflowId,
                        u.count,
                    ])
                );

                const workflowUsers = workflowIds.length
                    ? await db
                        .select()
                        .from(dbSchema.WorkflowUser)
                        .where(
                            inArray(
                                dbSchema.WorkflowUser.idWorkflow,
                                workflowIds
                            )
                        )
                    : [];

                const workflowUsersMap = new Map<
                    number,
                    any[]
                >();

                for (const wu of workflowUsers) {
                    const idWorkflow = wu.idWorkflow as number;
                    if (!workflowUsersMap.has(idWorkflow)) {
                        workflowUsersMap.set(idWorkflow, []);
                    }
                    workflowUsersMap.get(idWorkflow)!.push({
                        id: wu.id.toString(),
                        name: wu.name,
                        institution: wu.institution,
                        city: wu.location?.city,
                        country: wu.location?.country,
                        lat: wu.location?.lat,
                        lng: wu.location?.lng,
                        type: wu.type,
                    });
                }

                const totalCountResult = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(dbSchema.Workflow)
                    .where(
                        conditions.length
                            ? and(...conditions)
                            : undefined
                    );

                const total = totalCountResult[0]?.count ?? 0;

                const ratings =
                    workflowIds.length > 0
                        ? await db
                            .select({
                                workflowId: dbSchema.WorkflowRating.idWorkflow,
                                rating: sql<number>`AVG(${dbSchema.WorkflowRating.rating})`,
                            })
                            .from(dbSchema.WorkflowRating)
                            .where(
                                inArray(
                                    dbSchema.WorkflowRating.idWorkflow,
                                    workflowIds
                                )
                            )
                            .groupBy(dbSchema.WorkflowRating.idWorkflow)
                        : [];

                const ratingByWorkflow = Object.fromEntries(
                    ratings.map((r) => [
                        r.workflowId,
                        Number(r.rating),
                    ])
                );

                return {
                    ok: true,
                    workflows: workflows.map((w) => ({
                        id: w.workflow.id,
                        name: w.workflow.name,
                        description: w.workflow.description,
                        difficulty: w.workflow.difficulty,
                        usageCount:
                            usageCountByWorkflow[w.workflow.id] ??
                            0,
                        createdAt: w.workflow.createdAt,
                        updatedAt: w.workflow.updatedAt,
                        createdBy: w.user
                            ? `${w.user.name} ${w.user.lastName}`
                            : null,
                        tags:
                            tagsByWorkflow[w.workflow.id] ??
                            [],
                        pipelineCode: w.workflow.pipeline?.pipelineCode ?? null,
                        pipelineGitLink: w.workflow.pipeline?.pipelineGitLink ?? null,
                        toolSequence: w.workflow.toolSequence
                            ? typeof w.workflow.toolSequence ===
                                "string"
                                ? JSON.parse(
                                    w.workflow.toolSequence
                                )
                                : w.workflow.toolSequence
                            : [],
                        usedBy:
                            workflowUsersMap.get(
                                w.workflow.id
                            ) ?? [],
                        idUser: w.user?.id,
                        rating: ratingByWorkflow[w.workflow.id] ?? 0,
                    })),
                    total,
                    hasMore:
                        input.page * input.limit < total,
                    currentPage: input.page,
                    totalPages: Math.ceil(
                        total / input.limit
                    ),
                };
            } catch (error) {
                console.error(error);
                return {
                    ok: false,
                    workflows: [],
                    total: 0,
                    hasMore: false,
                    currentPage: input.page,
                    totalPages: 0,
                    error: "Failed to fetch workflows",
                };
            }
        }),

    getUseCases: publicProcedure
        .input(
            z.object({
                limit: z.number().max(50).default(10),
                page: z.number().default(1),
                offset: z.number().default(0),
                searchQuery: z.string().optional(),
                filters: z
                    .object({
                        tags: z.array(z.string()).optional(),
                        difficulty: z.enum([
                            "beginner",
                            "intermediate",
                            "advanced",
                        ]).optional(),
                        sortBy: z
                            .enum([
                                "rating",
                                "citations",
                                "recent",
                                "usage",
                            ])
                            .optional()
                            .default("recent"),
                    })
                    .optional()
                    .default({}),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                const token =
                    getCookieHelper(
                        ctx.req,
                        auth.sessionCookieName ?? ""
                    ) ?? "";

                await auth.validateSessionToken(token);

                const conditions: any[] = [];

                if (input.searchQuery?.trim()) {
                    conditions.push(
                        or(
                            ilike(
                                dbSchema.UseCase.title,
                                `%${input.searchQuery}%`
                            ),
                            ilike(
                                dbSchema.UseCase.description,
                                `%${input.searchQuery}%`
                            )
                        )
                    );
                }

                if (input.filters?.difficulty) {
                    conditions.push(
                        eq(
                            dbSchema.UseCase.difficulty,
                            input.filters.difficulty
                        )
                    );
                }

                const avgRatingSubquery = db
                    .select({
                        useCaseId: dbSchema.UseCaseRating.idUseCase,
                        avgRating: sql<number>`AVG(${dbSchema.UseCaseRating.rating})`.as('avg_rating')
                    })
                    .from(dbSchema.UseCaseRating)
                    .groupBy(dbSchema.UseCaseRating.idUseCase)
                    .as('avg_ratings');

                let orderBy;
                switch (input.filters?.sortBy) {
                    case "rating":
                        orderBy = desc(sql`avg_rating`);
                        break;
                    case "usage":
                        orderBy = desc(dbSchema.UseCase.createdAt);
                        break;
                    case "recent":
                    default:
                        orderBy = desc(dbSchema.UseCase.createdAt);
                }

                const useCases = await db
                    .select({
                        use_case: dbSchema.UseCase,
                        user: dbSchema.User,
                        avgRating: sql<number>`COALESCE(${avgRatingSubquery.avgRating}, 0)`
                    })
                    .from(dbSchema.UseCase)
                    .leftJoin(dbSchema.User, eq(dbSchema.UseCase.idUser, dbSchema.User.id))
                    .leftJoin(avgRatingSubquery, eq(dbSchema.UseCase.id, avgRatingSubquery.useCaseId))
                    .where(
                        conditions.length
                            ? and(...conditions)
                            : undefined
                    )
                    .orderBy(orderBy)
                    .limit(input.limit)
                    .offset(
                        (input.page - 1) * input.limit +
                        input.offset
                    );

                const totalCountResult = await db
                    .select({
                        count: sql<number>`count(*)`,
                    })
                    .from(dbSchema.UseCase)
                    .where(
                        conditions.length
                            ? and(...conditions)
                            : undefined
                    );

                const totalCount =
                    totalCountResult[0]?.count ?? 0;

                const useCaseIds = useCases.map(
                    (u) => u.use_case.id
                );

                const useCaseUsers =
                    useCaseIds.length > 0
                        ? await db
                            .select()
                            .from(dbSchema.UseCaseUser)
                            .where(
                                inArray(
                                    dbSchema.UseCaseUser.idUseCase,
                                    useCaseIds
                                )
                            )
                        : [];

                const useCaseUsersMap = new Map<
                    number,
                    any[]
                >();

                for (const uu of useCaseUsers) {
                    const location =
                        typeof uu.location === "string"
                            ? JSON.parse(uu.location)
                            : uu.location ?? {};

                    const idUseCase = uu.idUseCase ?? 0;

                    if (!useCaseUsersMap.has(idUseCase)) {
                        useCaseUsersMap.set(
                            idUseCase,
                            []
                        );
                    }

                    useCaseUsersMap.get(idUseCase)!.push({
                        id: uu.id.toString(),
                        name: uu.name,
                        institution: uu.institution,
                        city: location.city ?? "",
                        country: location.country ?? "",
                        lat: location.lat ?? 0,
                        lng: location.lng ?? 0,
                        type: uu.type,
                    });
                }

                const usageCounts =
                    useCaseIds.length > 0
                        ? await db
                            .select({
                                useCaseId:
                                    dbSchema.UseCaseUser.idUseCase,
                                count: sql<number>`count(*)`,
                            })
                            .from(dbSchema.UseCaseUser)
                            .where(
                                inArray(
                                    dbSchema.UseCaseUser.idUseCase,
                                    useCaseIds
                                )
                            )
                            .groupBy(
                                dbSchema.UseCaseUser.idUseCase
                            )
                        : [];

                const usageCountByUseCase = Object.fromEntries(
                    usageCounts.map((u) => [
                        u.useCaseId,
                        u.count,
                    ])
                );

                const ratings =
                    useCaseIds.length > 0
                        ? await db
                            .select({
                                useCaseId: dbSchema.UseCaseRating.idUseCase,
                                rating: sql<number>`AVG(${dbSchema.UseCaseRating.rating})`,
                            })
                            .from(dbSchema.UseCaseRating)
                            .where(
                                inArray(
                                    dbSchema.UseCaseRating.idUseCase,
                                    useCaseIds
                                )
                            )
                            .groupBy(dbSchema.UseCaseRating.idUseCase)
                        : [];

                const ratingByUseCase = Object.fromEntries(
                    ratings.map((r) => [
                        r.useCaseId,
                        Number(r.rating),
                    ])
                );

                return {
                    ok: true,
                    useCases: useCases.map((useCase) => {
                        let recommendedTools: number[] = [];

                        const rt =
                            useCase.use_case
                                .recommendedTools;

                        if (rt) {
                            if (typeof rt === "string") {
                                try {
                                    const parsed =
                                        JSON.parse(rt);
                                    if (
                                        Array.isArray(parsed)
                                    ) {
                                        recommendedTools =
                                            parsed;
                                    }
                                } catch {
                                    recommendedTools = [];
                                }
                            } else if (
                                Array.isArray(rt)
                            ) {
                                recommendedTools = rt;
                            }
                        }

                        return {
                            id: useCase.use_case.id,
                            title: useCase.use_case.title,
                            description:
                                useCase.use_case.description,
                            difficulty:
                                useCase.use_case.difficulty,
                            usageCount:
                                usageCountByUseCase[
                                useCase.use_case.id
                                ] ?? 0,
                            createdAt:
                                useCase.use_case.createdAt,
                            createdBy: useCase.user
                                ? `${useCase.user.name} ${useCase.user.lastName}`
                                : null,
                            recommendedTools,
                            steps:
                                useCase.use_case
                                    .stepByStepGuide,
                            usedBy:
                                useCaseUsersMap.get(
                                    useCase.use_case.id
                                ) ?? [],
                            idUser: useCase.user?.id,
                            rating:
                                ratingByUseCase[useCase.use_case.id] ?? 0,
                        };
                    }),
                    total: totalCount,
                    hasMore:
                        input.page * input.limit <
                        totalCount,
                    currentPage: input.page,
                    totalPages: Math.ceil(
                        totalCount / input.limit
                    ),
                };
            } catch (error) {
                console.error(
                    "Error fetching:",
                    error
                );

                if (error instanceof Error) {
                    console.error(error.message);
                    console.error(error.stack);
                }

                return {
                    ok: false,
                    error: "Failed to fetch",
                    useCases: [],
                    total: 0,
                    hasMore: false,
                    currentPage: input.page,
                    totalPages: 0,
                };
            }
        }),

    markAsUsing: authProcedure
        .input(
            z.object({
                name: z.string(),
                institution: z.string(),
                city: z.string(),
                country: z.string(),
                state: z.string(),
                userType: z.enum(["student", "researcher", "lab"]).default("researcher"),
                itemType: z.enum(["tool", "workflow", "usecase"]).default("tool"),
                id: z.number(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const geo = await geocodeLocation(
                input.city,
                input.state,
                input.country,
            )

            if (!geo) {
                throw new Error("Não foi possível determinar latitude/longitude")
            }


            if (input.itemType === "workflow") {
                const workflowUser = await db.select().from(dbSchema.WorkflowUser).where(and(
                    eq(dbSchema.WorkflowUser.idWorkflow, input.id),
                    eq(dbSchema.WorkflowUser.idUser, ctx.user.id),
                ))
                if (workflowUser.length > 0) {
                    return {
                        ok: true,
                    }
                }

                await db.insert(dbSchema.WorkflowUser).values({
                    idWorkflow: input.id,
                    idUser: ctx.user.id,
                    name: input.name,
                    institution: input.institution,
                    location: {
                        city: input.city,
                        country: input.country,
                        state: input.state,
                        lat: geo.lat,
                        lng: geo.lon,
                    },
                    type: input.userType,
                })
            }
            else if (input.itemType === "usecase") {
                const useCaseUser = await db.select().from(dbSchema.UseCaseUser).where(and(
                    eq(dbSchema.UseCaseUser.idUseCase, input.id),
                    eq(dbSchema.UseCaseUser.idUser, ctx.user.id),
                ))
                if (useCaseUser.length > 0) {
                    return {
                        ok: true,
                    }
                }
                await db.insert(dbSchema.UseCaseUser).values({
                    idUseCase: input.id,
                    idUser: ctx.user.id,
                    name: input.name,
                    institution: input.institution,
                    location: {
                        city: input.city,
                        country: input.country,
                        state: input.state,
                        lat: geo.lat,
                        lng: geo.lon,
                    },
                    type: input.userType,
                })
            }
            else if (input.itemType === "tool" || input.itemType === "database") {
                const toolUser = await db.select().from(dbSchema.ToolUser).where(and(
                    eq(dbSchema.ToolUser.idTool, input.id),
                    eq(dbSchema.ToolUser.idUser, ctx.user.id),
                ))
                if (toolUser.length > 0) {
                    return {
                        ok: true,
                    }
                }
                await db.insert(dbSchema.ToolUser).values({
                    idTool: input.id,
                    idUser: ctx.user.id,
                    name: input.name,
                    institution: input.institution,
                    location: {
                        city: input.city,
                        country: input.country,
                        state: input.state,
                        lat: geo.lat,
                        lng: geo.lon,
                    },
                    type: input.userType,
                })
            }

            return {
                ok: true,
            }
        }),

    deleteWorkflow: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const workflow = await db
                .select({ id: dbSchema.Workflow.id, idUser: dbSchema.Workflow.idUser, name: dbSchema.Workflow.name, description: dbSchema.Workflow.description, difficulty: dbSchema.Workflow.difficulty, toolSequence: dbSchema.Workflow.toolSequence, pipeline: dbSchema.Workflow.pipeline })
                .from(dbSchema.Workflow)
                .where(eq(dbSchema.Workflow.id, input.id))
                .limit(1)
                .then((res) => res[0]);

            if (!workflow) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
            }

            if (workflow.idUser !== ctx.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this workflow" });
            }

            const relatedQuestions = await db
                .select({ id: dbSchema.Question.id })
                .from(dbSchema.Question)
                .where(eq(dbSchema.Question.relatedWorkflow, input.id));

            if (relatedQuestions.length > 0) {
                const relatedQuestionIds = relatedQuestions.map((question) => question.id);
                await db.delete(dbSchema.VoteCommentQuestion).where(inArray(dbSchema.VoteCommentQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.CommentQuestion).where(inArray(dbSchema.CommentQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.VoteQuestion).where(inArray(dbSchema.VoteQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.QuestionTag).where(inArray(dbSchema.QuestionTag.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.Question).where(inArray(dbSchema.Question.id, relatedQuestionIds));
            }

            await db.delete(dbSchema.WorkflowRating).where(eq(dbSchema.WorkflowRating.idWorkflow, input.id));
            await db.delete(dbSchema.WorkflowUser).where(eq(dbSchema.WorkflowUser.idWorkflow, input.id));
            await db.delete(dbSchema.WorkflowTag).where(eq(dbSchema.WorkflowTag.idWorkflow, input.id));
            await db.delete(dbSchema.Workflow).where(eq(dbSchema.Workflow.id, input.id));

            await db.insert(dbSchema.DeletionLog).values({
                entityType: "workflow",
                entityId: input.id,
                deletedBy: ctx.user.id,
                payload: {
                    id: workflow.id,
                    name: workflow.name,
                    description: workflow.description,
                    difficulty: workflow.difficulty,
                    toolSequence: workflow.toolSequence,
                    pipeline: workflow.pipeline,
                },
            });

            return { ok: true };
        }),

    deleteUseCase: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const useCase = await db
                .select({ id: dbSchema.UseCase.id, idUser: dbSchema.UseCase.idUser, title: dbSchema.UseCase.title, description: dbSchema.UseCase.description, recommendedTools: dbSchema.UseCase.recommendedTools, stepByStepGuide: dbSchema.UseCase.stepByStepGuide, difficulty: dbSchema.UseCase.difficulty })
                .from(dbSchema.UseCase)
                .where(eq(dbSchema.UseCase.id, input.id))
                .limit(1)
                .then((res) => res[0]);

            if (!useCase) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Use case not found" });
            }

            if (useCase.idUser !== ctx.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this use case" });
            }

            const relatedQuestions = await db
                .select({ id: dbSchema.Question.id })
                .from(dbSchema.Question)
                .where(eq(dbSchema.Question.relatedUseCase, input.id));

            if (relatedQuestions.length > 0) {
                const relatedQuestionIds = relatedQuestions.map((question) => question.id);
                await db.delete(dbSchema.VoteCommentQuestion).where(inArray(dbSchema.VoteCommentQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.CommentQuestion).where(inArray(dbSchema.CommentQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.VoteQuestion).where(inArray(dbSchema.VoteQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.QuestionTag).where(inArray(dbSchema.QuestionTag.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.Question).where(inArray(dbSchema.Question.id, relatedQuestionIds));
            }

            await db.delete(dbSchema.UseCaseRating).where(eq(dbSchema.UseCaseRating.idUseCase, input.id));
            await db.delete(dbSchema.UseCaseUser).where(eq(dbSchema.UseCaseUser.idUseCase, input.id));
            await db.delete(dbSchema.UseCase).where(eq(dbSchema.UseCase.id, input.id));

            await db.insert(dbSchema.DeletionLog).values({
                entityType: "usecase",
                entityId: input.id,
                deletedBy: ctx.user.id,
                payload: {
                    id: useCase.id,
                    title: useCase.title,
                    description: useCase.description,
                    recommendedTools: useCase.recommendedTools,
                    stepByStepGuide: useCase.stepByStepGuide,
                    difficulty: useCase.difficulty,
                },
            });

            return { ok: true };
        }),

    getWorkflowLocations: publicProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .query(async ({ input }) => {
            const workflow = await db.select().from(dbSchema.Workflow).where(eq(dbSchema.Workflow.id, input.id)).limit(1).then((res) => res[0])

            if (!workflow) {
                return null
            }

            const locations = await db.select()
                .from(dbSchema.WorkflowUser)
                .where(eq(dbSchema.WorkflowUser.idWorkflow, input.id))
                .then((res) => res.map((loc) => {
                    const locData = parseLocation(loc.location);

                    return {
                        id: loc.id,
                        name: loc.name,
                        institution: loc.institution,
                        city: locData?.city || "",
                        country: locData?.country || "",
                        state: locData?.state || "",
                        lat: locData?.lat || 0,
                        lng: locData?.lng || 0,
                        type: loc.type,
                    };
                }));

            return locations;
        }),
    getUseCaseLocations: publicProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .query(async ({ input }) => {
            const usecase = await db.select().from(dbSchema.UseCase).where(eq(dbSchema.UseCase.id, input.id)).limit(1).then((res) => res[0])

            if (!usecase) {
                return null
            }

            const locations = await db.select()
                .from(dbSchema.UseCaseUser)
                .where(eq(dbSchema.UseCaseUser.idUseCase, input.id))
                .then((res) => res.map((loc) => {
                    const locData = parseLocation(loc.location);

                    return {
                        id: loc.id,
                        name: loc.name,
                        institution: loc.institution,
                        city: locData?.city || "",
                        country: locData?.country || "",
                        state: locData?.state || "",
                        lat: locData?.lat || 0,
                        lng: locData?.lng || 0,
                        type: loc.type,
                    };
                }));

            return locations;
        }),
    getToolLocations: publicProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .query(async ({ input }) => {
            const tool = await db.select().from(dbSchema.Tool).where(eq(dbSchema.Tool.id, input.id)).limit(1).then((res) => res[0])

            if (!tool) {
                return null
            }

            const locations = await db.select()
                .from(dbSchema.ToolUser)
                .where(eq(dbSchema.ToolUser.idTool, input.id))
                .then((res) => res.map((loc) => {
                    const locData = parseLocation(loc.location);

                    return {
                        id: loc.id,
                        name: loc.name,
                        institution: loc.institution,
                        city: locData?.city || "",
                        country: locData?.country || "",
                        state: locData?.state || "",
                        lat: locData?.lat || 0,
                        lng: locData?.lng || 0,
                        type: loc.type,
                    };
                }));

            return locations;
        }),
    submitRating: authProcedure
        .input(
            z.object({
                id: z.number(),
                type: z.enum(["workflow", "usecase", "tool", "database"]),
                rating: z.number().min(1).max(5),
                comment: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            if (input.type === "workflow") {
                const existing = await db
                    .select({ id: dbSchema.WorkflowRating.id })
                    .from(dbSchema.WorkflowRating)
                    .where(
                        and(
                            eq(dbSchema.WorkflowRating.idUser, userId),
                            eq(dbSchema.WorkflowRating.idWorkflow, input.id),
                        ),
                    )
                    .limit(1);

                if (existing.length > 0) {
                    await db
                        .update(dbSchema.WorkflowRating)
                        .set({
                            rating: input.rating,
                            comment: input.comment || null,
                            updatedAt: new Date(),
                        })
                        .where(eq(dbSchema.WorkflowRating.id, existing[0].id));

                    return { updated: true };
                }

                const [{ insertId }] = await db
                    .insert(dbSchema.WorkflowRating)
                    .values({
                        idUser: userId,
                        idWorkflow: input.id,
                        rating: input.rating,
                        comment: input.comment || null,
                    });

                return { created: true, id: insertId };
            }
            if (input.type === "usecase") {
                const existing = await db
                    .select({ id: dbSchema.UseCaseRating.id })
                    .from(dbSchema.UseCaseRating)
                    .where(
                        and(
                            eq(dbSchema.UseCaseRating.idUser, userId),
                            eq(dbSchema.UseCaseRating.idUseCase, input.id),
                        ),
                    )
                    .limit(1);

                if (existing.length > 0) {
                    await db
                        .update(dbSchema.UseCaseRating)
                        .set({
                            rating: input.rating,
                            comment: input.comment || null,
                            updatedAt: new Date(),
                        })
                        .where(eq(dbSchema.UseCaseRating.id, existing[0].id));

                    return { updated: true };
                }

                const [{ insertId }] = await db
                    .insert(dbSchema.UseCaseRating)
                    .values({
                        idUser: userId,
                        idUseCase: input.id,
                        rating: input.rating,
                        comment: input.comment || null,
                    });

                return { created: true, id: insertId };
            }
            if (input.type === "tool" || input.type === "database") {
                const existing = await db
                    .select({ id: dbSchema.ToolRating.id })
                    .from(dbSchema.ToolRating)
                    .where(
                        and(
                            eq(dbSchema.ToolRating.idUser, userId),
                            eq(dbSchema.ToolRating.idTool, input.id),
                        ),
                    )
                    .limit(1);

                if (existing.length > 0) {
                    await db
                        .update(dbSchema.ToolRating)
                        .set({
                            rating: input.rating,
                            comment: input.comment || null,
                            updatedAt: new Date(),
                        })
                        .where(eq(dbSchema.ToolRating.id, existing[0].id));

                    return { updated: true };
                }

                const [{ insertId }] = await db
                    .insert(dbSchema.ToolRating)
                    .values({
                        idUser: userId,
                        idTool: input.id,
                        rating: input.rating,
                        comment: input.comment || null,
                    });

                return { created: true, id: insertId };
            }

            return { error: "Tipo não suportado" };
        }),
    getUserRatings: authProcedure.input(z.object({
        type: z.enum(["workflow", "usecase", "tool", "database"]),
        id: z.number()
    }))
        .query(async ({ ctx, input }) => {
            if (input.type === "workflow") {
                const workflow = await db.select().from(dbSchema.WorkflowRating).where(eq(dbSchema.WorkflowRating.idUser, ctx.user.id)).limit(1).then((res) => res[0])
                return {
                    ok: true,
                    rating: workflow.rating
                }
            }
            else if (input.type === "usecase") {
                const useCase = await db.select().from(dbSchema.UseCaseRating).where(eq(dbSchema.UseCaseRating.idUser, ctx.user.id)).limit(1).then((res) => res[0])
                return {
                    ok: true,
                    rating: useCase.rating
                }
            }
            else if (input.type === "tool" || input.type === "database") {
                const tool = await db.select().from(dbSchema.ToolRating).where(eq(dbSchema.ToolRating.idUser, ctx.user.id)).limit(1).then((res) => res[0])
                return {
                    ok: true,
                    rating: tool.rating
                }
            }
            else {
                return {
                    ok: false,
                    rating: 0
                }
            }
        }),
})