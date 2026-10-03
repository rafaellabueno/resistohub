
import { authProcedure, publicProcedure, router } from "../trpc"
import { db, dbSchema } from "../../db"
import { sql, eq, desc, count, name, inArray } from "drizzle-orm"
import { z } from "zod"
import { ee } from "../../events/events"
import { checkFileExistsMinIO, getPreSignedUrlMinIO, uploadImageMinIO } from "../../utils/upload"
import { TRPCError } from "@trpc/server"
import { insertNotification } from "../controllers/notifications"

export const protocolRouter = router({
    getProtocols: publicProcedure
        .input(
            z.object({
                limit: z.number().max(50).default(10),
                page: z.number().default(1),
                offset: z.number().default(0),
                searchQuery: z.string().optional(),
                filters: z.string().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            let parsedFilters: any = {};

            if (input.filters && input.filters.trim() !== '') {
                try {
                    parsedFilters = JSON.parse(input.filters);
                } catch {
                }
            }

            const protocolsRaw = await db
                .select()
                .from(dbSchema.Protocol)
                .leftJoin(
                    dbSchema.ProtocolTag,
                    eq(dbSchema.Protocol.id, dbSchema.ProtocolTag.idProtocol),
                )
                .leftJoin(
                    dbSchema.Tag,
                    eq(dbSchema.ProtocolTag.idTag, dbSchema.Tag.id),
                )
                .leftJoin(
                    dbSchema.User,
                    eq(dbSchema.Protocol.idUser, dbSchema.User.id),
                )
                .orderBy(desc(dbSchema.Protocol.id));

            const protocolsMap = new Map<number, any>();

            for (const { protocol, tag, user } of protocolsRaw) {
                if (!protocolsMap.has(protocol.id)) {
                    const [{ count }] = await db
                        .select({
                            count: sql<number>`count(*)`,
                        })
                        .from(dbSchema.Question)
                        .where(
                            eq(
                                dbSchema.Question.relatedProtocol,
                                protocol.id,
                            ),
                        );

                    protocolsMap.set(protocol.id, {
                        ...protocol,
                        tags: new Set<string>(),
                        citations: count,
                        createdBy: user?.name + ' ' + user?.lastName,
                    });
                }

                if (tag) {
                    protocolsMap
                        .get(protocol.id)
                        .tags.add(tag.tag);
                }
            }

            let protocolsArray = Array.from(protocolsMap.values());

            if (
                parsedFilters.tags &&
                Array.isArray(parsedFilters.tags)
            ) {
                protocolsArray = protocolsArray.filter(
                    (protocol) =>
                        parsedFilters.tags.every((tag: string) =>
                            protocol.tags.has(tag),
                        ),
                );
            }

            if (
                input.searchQuery &&
                input.searchQuery.trim() !== ''
            ) {
                const query =
                    input.searchQuery.toLowerCase();

                protocolsArray = protocolsArray.filter(
                    (protocol) =>
                        protocol.title
                            .toLowerCase()
                            .includes(query) ||
                        protocol.description
                            ?.toLowerCase()
                            .includes(query) ||
                        Array.from(protocol.tags).some(
                            (tag) => {
                                const stringTag = tag as string;
                                return stringTag
                                    .toLowerCase()
                                    .includes(query);
                            },
                        ),
                );
            }

            const totalCount = protocolsArray.length;
            const offset =
                (input.page - 1) * input.limit +
                input.offset;

            const paginatedProtocols =
                protocolsArray.slice(
                    offset,
                    offset + input.limit,
                );

            return {
                ok: true,
                currentPage: input.page,
                totalPages: Math.ceil(
                    totalCount / input.limit,
                ),
                protocols: paginatedProtocols.map(
                    (p) => ({
                        ...p,
                        tags: Array.from(p.tags),
                    }),
                ),
                totalCount,
            };
        }),

    getProcotolById: publicProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const protocol = await db
                .select({
                    id: dbSchema.Protocol.id,
                    title: dbSchema.Protocol.title,
                    description: dbSchema.Protocol.description,
                    category: dbSchema.Protocol.category,
                    institution: dbSchema.Protocol.institution,
                    authors: dbSchema.Protocol.authors,
                    date: dbSchema.Protocol.date,
                    validation: dbSchema.Protocol.validation,
                    estimatedTime: dbSchema.Protocol.estimatedTime,
                    doi: dbSchema.Protocol.doi,
                    materials: dbSchema.Protocol.materials,
                    methodology: dbSchema.Protocol.methodology,
                    troubleshooting: dbSchema.Protocol.troubleshooting,
                    document: dbSchema.Protocol.document,
                    protocolType: dbSchema.Protocol.protocolType,
                    name: dbSchema.User.name,
                    lastName: dbSchema.User.lastName,
                    idUser: dbSchema.Protocol.idUser,
                })
                .from(dbSchema.Protocol)
                .leftJoin(dbSchema.User, eq(dbSchema.Protocol.idUser, dbSchema.User.id))
                .where(eq(dbSchema.Protocol.id, input.id))
                .limit(1);

            const citations = await db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(dbSchema.Question)
                .where(eq(dbSchema.Question.relatedProtocol, input.id))
                .limit(1);

            const tags = await db
                .select({
                    tag: dbSchema.Tag.tag,
                })
                .from(dbSchema.ProtocolTag)
                .leftJoin(dbSchema.Tag, eq(dbSchema.ProtocolTag.idTag, dbSchema.Tag.id))
                .where(eq(dbSchema.ProtocolTag.idProtocol, input.id));


            return {
                ok: true,
                protocol: {
                    ...protocol[0],
                    tags: tags.map(t => t.tag),
                    citations: citations,
                    createdBy: protocol[0].name + ' ' + protocol[0].lastName,
                }
            }
        }),
    saveProtocol: authProcedure
        .input(
            z.object({
                title: z.string(),
                category: z.string(),
                description: z.string(),
                references: z.array(z.object({
                    type: z.string(),
                    value: z.string(),
                })),
                authors: z.string(),
                institution: z.string(),
                validation: z.string(),
                estimatedTime: z.string(),
                methodology: z.string(),
                materials: z.string(),
                troubleshooting: z.string(),
                tags: z.array(z.string()),
                file: z.string(),
                protocolType: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const result = await uploadImageMinIO({
                image: input.file,
            })

            const [{ insertId }] = await db.insert(dbSchema.Protocol).values({
                title: input.title,
                category: input.category,
                description: input.description,
                doi: input.references,
                authors: input.authors,
                institution: input.institution,
                date: new Date(),
                validation: input.validation,
                estimatedTime: input.estimatedTime,
                methodology: input.methodology,
                materials: input.materials,
                troubleshooting: input.troubleshooting,
                idUser: ctx.user.id,
                document: result.fileName,
                protocolType: input.protocolType,
            })

            const insertIdProtocol = insertId

            for (const tag of input.tags) {
                const [{ insertId }] = await db.insert(dbSchema.Tag).values({
                    tag: tag
                })
                await db.insert(dbSchema.ProtocolTag).values({
                    idProtocol: insertIdProtocol,
                    idTag: insertId
                })
            }

            const replacements = {
                title: input.title,
                category: input.category,
                description: input.description,
            }

            ee.emit("sendEmail", {
                email: "resistohub@ufcspa.edu.br",
                subject: "Novo protocolo",
                fileName: "newProtocol",
                replacements: replacements,
            })

            return {
                ok: true,
            }
        }),
    getProtocolImage: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
            const { id } = input
            const file = await db
                .select({ document: dbSchema.Protocol.document })
                .from(dbSchema.Protocol)
                .where(eq(dbSchema.Protocol.id, id))
                .limit(1)


            if (file.length > 0 && file[0].document) {
                const fileName = file[0].document

                const exists = await checkFileExistsMinIO(fileName)

                if (exists) {
                    const preSign = await getPreSignedUrlMinIO(fileName)
                    return { link: preSign }
                }
            }
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get ECAC file",
            })
        }),
    deleteProtocol: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const protocol = await db
                .select({ id: dbSchema.Protocol.id, idUser: dbSchema.Protocol.idUser, title: dbSchema.Protocol.title, description: dbSchema.Protocol.description, document: dbSchema.Protocol.document })
                .from(dbSchema.Protocol)
                .where(eq(dbSchema.Protocol.id, input.id))
                .limit(1)
                .then((res) => res[0]);

            if (!protocol) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Protocol not found" });
            }

            if (protocol.idUser !== ctx.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this protocol" });
            }

            const relatedQuestions = await db
                .select({ id: dbSchema.Question.id })
                .from(dbSchema.Question)
                .where(eq(dbSchema.Question.relatedProtocol, input.id));

            if (relatedQuestions.length > 0) {
                const relatedQuestionIds = relatedQuestions.map((question) => question.id);
                await db.delete(dbSchema.VoteCommentQuestion).where(inArray(dbSchema.VoteCommentQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.CommentQuestion).where(inArray(dbSchema.CommentQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.VoteQuestion).where(inArray(dbSchema.VoteQuestion.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.QuestionTag).where(inArray(dbSchema.QuestionTag.idQuestion, relatedQuestionIds));
                await db.delete(dbSchema.Question).where(inArray(dbSchema.Question.id, relatedQuestionIds));
            }

            await db.delete(dbSchema.ProtocolTag).where(eq(dbSchema.ProtocolTag.idProtocol, input.id));
            await db.delete(dbSchema.Protocol).where(eq(dbSchema.Protocol.id, input.id));

            await db.insert(dbSchema.DeletionLog).values({
                entityType: "protocol",
                entityId: input.id,
                deletedBy: ctx.user.id,
                payload: {
                    id: protocol.id,
                    title: protocol.title,
                    description: protocol.description,
                    document: protocol.document,
                },
            });

            return { ok: true };
        }),
    saveForumPost: authProcedure.input(
        z.object({
            title: z.string(),
            message: z.string(),
            tags: z.string(),
            relatedProtocol: z.number().optional(),
        }),
    ).mutation(async ({ input, ctx }) => {
        const [{ insertId }] = await db.insert(dbSchema.Question).values({
            idUser: ctx.user.id,
            question: input.title,
            description: input.message,
            resolved: "no",
            relatedProtocol: input.relatedProtocol,
        })

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

        const userProtocol = await db.select().from(dbSchema.Protocol).where(eq(dbSchema.Protocol.id, input.relatedProtocol ?? 0)).limit(1).then((res) => res[0]);

        if (userProtocol && userProtocol.idUser !== null) {
            insertNotification({
                userId: userProtocol.idUser as number,
                texts: {
                    "pt-br": `Um usuário começou uma discussão sobre o protocolo: ${userProtocol.title}`,
                    "en-us": `A user started a discussion about the protocol: ${userProtocol.title}`,
                    "es-es": `Un usuario comenzó una discusión sobre el protocolo: ${userProtocol.title}`,
                },
                links: [{
                    link: `/question/${insertId}`,
                    titles: {
                        "pt-br": `Ver a questão`,
                        "en-us": `View the question`,
                        "es-es": `Ver la pregunta`,
                    }
                }],
            })
        }


        return { id: insertId }
    }),
})