import { z } from "zod";
import { authProcedure, publicProcedure, router } from "../trpc";
import { db, dbSchema } from "../../db"
import { eq, desc, sql, gte, lte, inArray, like, or, asc, SQLWrapper, and } from "drizzle-orm"
import { insertNotification } from "../controllers/notifications";
import { getCookieHelper } from "../cookieHelper"
import { auth } from "../../auth"
import { checkFileExistsMinIO, getPreSignedUrlMinIO } from "../../utils/upload";
import { TRPCError } from "@trpc/server";

export const communityRouter = router({
    deleteQuestion: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const question = await db
                .select()
                .from(dbSchema.Question)
                .where(eq(dbSchema.Question.id, input.id))
                .limit(1)
                .then((res) => res[0]);

            if (!question) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
            }

            if (question.idUser !== ctx.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this question" });
            }

            const commentIds = await db
                .select({ id: dbSchema.CommentQuestion.id })
                .from(dbSchema.CommentQuestion)
                .where(eq(dbSchema.CommentQuestion.idQuestion, input.id));

            await db.delete(dbSchema.VoteCommentQuestion).where(eq(dbSchema.VoteCommentQuestion.idQuestion, input.id));
            if (commentIds.length > 0) {
                await db.delete(dbSchema.VoteCommentQuestion).where(inArray(dbSchema.VoteCommentQuestion.idComment, commentIds.map((comment) => comment.id)));
            }
            await db.delete(dbSchema.CommentQuestion).where(eq(dbSchema.CommentQuestion.idQuestion, input.id));
            await db.delete(dbSchema.VoteQuestion).where(eq(dbSchema.VoteQuestion.idQuestion, input.id));
            await db.delete(dbSchema.QuestionTag).where(eq(dbSchema.QuestionTag.idQuestion, input.id));
            await db.delete(dbSchema.Question).where(eq(dbSchema.Question.id, input.id));

            await db.insert(dbSchema.DeletionLog).values({
                entityType: "question",
                entityId: input.id,
                deletedBy: ctx.user.id,
                payload: question,
            });

            return { ok: true };
        }),

    deleteCommentQuestion: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const comment = await db
                .select()
                .from(dbSchema.CommentQuestion)
                .where(eq(dbSchema.CommentQuestion.id, input.id))
                .limit(1)
                .then((res) => res[0]);

            if (!comment) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
            }

            if (comment.idUser !== ctx.user.id) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this comment" });
            }

            await db.delete(dbSchema.VoteCommentQuestion).where(eq(dbSchema.VoteCommentQuestion.idComment, input.id));
            await db.delete(dbSchema.CommentQuestion).where(eq(dbSchema.CommentQuestion.id, input.id));

            await db.insert(dbSchema.DeletionLog).values({
                entityType: "comment-question",
                entityId: input.id,
                deletedBy: ctx.user.id,
                payload: comment,
            });

            return { ok: true };
        }),

    voteCommentQuestion: authProcedure
        .input(
            z.object({
                id: z.number(),
                idComment: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const userVote = await db.select().from(dbSchema.VoteCommentQuestion).where(and(
                eq(dbSchema.VoteCommentQuestion.idUser, ctx.user.id),
                eq(dbSchema.VoteCommentQuestion.idQuestion, input.id),
                eq(dbSchema.VoteCommentQuestion.idComment, input.idComment)
            ))

            if (userVote.length > 0) {
                return {
                    ok: false,
                }
            }

            const [{ insertId }] = await db.insert(dbSchema.VoteCommentQuestion).values({
                idUser: ctx.user.id,
                idQuestion: input.id,
                idComment: input.idComment
            })

            const comment = await db.select().from(dbSchema.CommentQuestion)
                .leftJoin(dbSchema.Question, eq(dbSchema.CommentQuestion.idQuestion, dbSchema.Question.id))
                .where(eq(dbSchema.CommentQuestion.id, input.idComment)).limit(1).then((res) => res[0])

            if (comment) {
                insertNotification({
                    userId: ctx.user.id,
                    texts: {
                        "pt-br": `Você votou na resposta ${comment.question?.question}`,
                        "en-us": `You voted in the answer ${comment.question?.question}`,
                        "es-es": `Has votado en la respuesta ${comment.question?.question}`,
                    },
                    links: [{
                        link: `/question/${comment.question?.id}`,
                        titles: {
                            "pt-br": `Ver a resposta`,
                            "en-us": `View the answer`,
                            "es-es": `Ver la respuesta`,
                        }
                    }],
                })
                if (comment.comment_question?.idUser !== null && comment.comment_question?.idUser !== ctx.user.id) {
                    insertNotification({
                        userId: comment.comment_question?.idUser,
                        texts: {
                            "pt-br": `Você recebeu um voto na resposta ${comment.question?.question}`,
                            "en-us": `You received a vote in the answer ${comment.question?.question}`,
                            "es-es": `Has recibido un voto en la respuesta ${comment.question?.question}`,
                        },
                        links: [{
                            link: `/question/${comment.question?.id}`,
                            titles: {
                                "pt-br": `Ver a resposta`,
                                "en-us": `View the answer`,
                                "es-es": `Ver la respuesta`,
                            }
                        }],
                    });
                }
            }

            return {
                ok: true,
                id: insertId
            }
        }),

    unvoteCommentQuestion: publicProcedure
        .input(
            z.object({
                id: z.number(),
                idComment: z.number(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.delete(dbSchema.VoteCommentQuestion).where(and(
                eq(dbSchema.VoteCommentQuestion.idQuestion, input.id),
                eq(dbSchema.VoteCommentQuestion.idComment, input.idComment)
            ))

            return {
                ok: true,
            }
        }),

    voteQuestion: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const userVote = await db.select().from(dbSchema.VoteQuestion).where(and(
                eq(dbSchema.VoteQuestion.idUser, ctx.user.id),
                eq(dbSchema.VoteQuestion.idQuestion, input.id)
            ))

            if (userVote.length > 0) {
                return {
                    ok: false,
                }
            }

            const [{ insertId }] = await db.insert(dbSchema.VoteQuestion).values({
                idUser: ctx.user.id,
                idQuestion: input.id
            })

            const question = await db.select().from(dbSchema.Question).where(eq(dbSchema.Question.id, input.id)).limit(1).then((res) => res[0])

            if (question) {
                insertNotification({
                    userId: ctx.user.id,
                    texts: {
                        "pt-br": `Você votou na questão ${question.question}`,
                        "en-us": `You voted in the question ${question.question}`,
                        "es-es": `Has votado en la pregunta ${question.question}`,
                    },
                    links: [{
                        link: `/question/${question.id}`,
                        titles: {
                            "pt-br": `Ver a questão`,
                            "en-us": `View the question`,
                            "es-es": `Ver la pregunta`,
                        }
                    }],
                })
                if (question.idUser !== null) {
                    insertNotification({
                        userId: question.idUser,
                        texts: {
                            "pt-br": `Você recebeu um voto na questão ${question.question}`,
                            "en-us": `You received a vote in the question ${question.question}`,
                            "es-es": `Has recibido un voto en la pregunta ${question.question}`,
                        },
                        links: [{
                            link: `/question/${question.id}`,
                            titles: {
                                "pt-br": `Ver a questão`,
                                "en-us": `View the question`,
                                "es-es": `Ver la pregunta`,
                            }
                        }],
                    });
                }
            }

            return {
                ok: true,
                id: insertId
            }
        }),

    unvoteQuestion: publicProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.delete(dbSchema.VoteQuestion).where(eq(dbSchema.VoteQuestion.idQuestion, input.id))

            return {
                ok: true,
            }
        }),

    getQuestionById: publicProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .query(async ({ input, ctx }) => {
            const token = getCookieHelper(ctx.req, auth.sessionCookieName ?? '') ?? '';
            const session = await auth.validateSessionToken(token);
            const question = await db.select()
                .from(dbSchema.Question)
                .leftJoin(dbSchema.User, eq(dbSchema.Question.idUser, dbSchema.User.id))
                .where(eq(dbSchema.Question.id, input.id))
                .limit(1)
                .then((res) => res[0])

            if (!question) {
                return null
            }

            const countVotes = await db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(dbSchema.VoteQuestion)
                .where(eq(dbSchema.VoteQuestion.idQuestion, input.id))
                .limit(1);

            const tags = await db
                .select({
                    id: dbSchema.Tag.id,
                    tag: dbSchema.Tag.tag,
                })
                .from(dbSchema.QuestionTag)
                .innerJoin(
                    dbSchema.Tag,
                    eq(dbSchema.QuestionTag.idTag, dbSchema.Tag.id)
                )
                .where(eq(dbSchema.QuestionTag.idQuestion, input.id))

            const countAnswers = await db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(dbSchema.CommentQuestion)
                .where(eq(dbSchema.CommentQuestion.idQuestion, input.id))
                .limit(1);

            let userVoteStatus = false;
            if (session?.user?.id) {
                const userVote = await db
                    .select({
                        id: dbSchema.VoteQuestion.idUser,
                    })
                    .from(dbSchema.VoteQuestion)
                    .where(and(
                        eq(dbSchema.VoteQuestion.idQuestion, input.id),
                        eq(dbSchema.VoteQuestion.idUser, session?.user?.id)
                    ))
                    .limit(1);

                userVoteStatus = userVote.length > 0;
            }

            return {
                ...question,
                tags: tags.map((t) => ({ id: t.id, tag: t.tag })) ?? [],
                votes: countVotes?.[0]?.count ?? 0,
                answers: countAnswers?.[0]?.count ?? 0,
                userVoteStatus: userVoteStatus,
            };
        }),

    getQuestionComments: publicProcedure
        .input(
            z.object({
                id: z.number(),
                limit: z.number().max(50).default(10),
                offset: z.number().default(0),
            }),
        )
        .query(async ({ input, ctx }) => {
            const comments = await db
                .select({
                    id: dbSchema.CommentQuestion.id,
                    comment: dbSchema.CommentQuestion.comment,
                    createdAt: dbSchema.CommentQuestion.createdAt,
                    authorName: dbSchema.User.name,
                    authorLastName: dbSchema.User.lastName,
                    authorId: dbSchema.User.id,
                    votes: sql<number>`count(${dbSchema.VoteCommentQuestion.id})`.as("votes"),
                })
                .from(dbSchema.CommentQuestion)
                .leftJoin(dbSchema.User, eq(dbSchema.CommentQuestion.idUser, dbSchema.User.id))
                .leftJoin(dbSchema.VoteCommentQuestion, eq(dbSchema.VoteCommentQuestion.idComment, dbSchema.CommentQuestion.id))
                .where(eq(dbSchema.CommentQuestion.idQuestion, input.id))
                .groupBy(dbSchema.CommentQuestion.id, dbSchema.User.name, dbSchema.User.lastName, dbSchema.CommentQuestion.createdAt, dbSchema.CommentQuestion.comment)
                .orderBy(asc(dbSchema.CommentQuestion.createdAt))
                .limit(input.limit)
                .offset(input.offset);

            const [{ count }] = await db
                .select({
                    count: sql<number>`count(*)`,
                })
                .from(dbSchema.CommentQuestion)
                .where(eq(dbSchema.CommentQuestion.idQuestion, input.id))
                .limit(1);

            if (ctx.user) {
                const commentPromises = comments.map(async (comment) => {
                    const userVote = await db
                        .select({
                            id: dbSchema.VoteCommentQuestion.idUser,
                        })
                        .from(dbSchema.VoteCommentQuestion)
                        .where(and(
                            eq(dbSchema.VoteCommentQuestion.idComment, comment.id),
                            eq(dbSchema.VoteCommentQuestion.idUser, (ctx.user as any).id)
                        ))
                        .limit(1);

                    return {
                        ...comment,
                        userVoteStatus: userVote.length > 0
                    };
                });

                const commentsWithVoteStatus = await Promise.all(commentPromises);

                return {
                    comments: commentsWithVoteStatus,
                    hasMore: comments.length === input.limit,
                };
            } else {
                const commentsWithoutVotes = comments.map(comment => ({
                    ...comment,
                    userVoteStatus: false
                }));

                return {
                    comments: commentsWithoutVotes,
                    hasMore: comments.length === input.limit,
                };
            }
        }),

    saveQuestionComment: authProcedure
        .input(
            z.object({
                id: z.number(),
                message: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const [{ insertId }] = await db.insert(dbSchema.CommentQuestion).values({
                idUser: ctx.user.id,
                idQuestion: input.id,
                comment: input.message,
            })

            const comment = await db.select().from(dbSchema.CommentQuestion)
                .leftJoin(dbSchema.Question, eq(dbSchema.CommentQuestion.idQuestion, dbSchema.Question.id))
                .where(eq(dbSchema.CommentQuestion.id, input.id)).limit(1).then((res) => res[0])

            if (comment) {
                insertNotification({
                    userId: ctx.user.id,
                    texts: {
                        "pt-br": `Você comentou na questão ${comment.question?.question}`,
                        "en-us": `You commented in the question ${comment.question?.question}`,
                        "es-es": `Has comentado en la pregunta ${comment.question?.question}`,
                    },
                    links: [{
                        link: `/question/${comment.question?.id}`,
                        titles: {
                            "pt-br": `Ver a questão`,
                            "en-us": `View the question`,
                            "es-es": `Ver la pregunta`,
                        }
                    }],
                })
                if (comment.comment_question?.idUser !== null && comment.comment_question.idUser !== ctx.user.id) {
                    insertNotification({
                        userId: comment.comment_question.idUser,
                        texts: {
                            "pt-br": `Você recebeu um comentário na questão ${comment.question?.question}`,
                            "en-us": `You received a comment in the question ${comment.question?.question}`,
                            "es-es": `Has recibido un comentario en la pregunta ${comment.question?.question}`,
                        },
                        links: [{
                            link: `/question/${comment.question?.id}`,
                            titles: {
                                "pt-br": `Ver a questão`,
                                "en-us": `View the question`,
                                "es-es": `Ver la pregunta`,
                            }
                        }],
                    });
                }
            }

            return {
                id: insertId
            }
        }),

    getRecentQuestions: publicProcedure
        .input(
            z.object({
                limit: z.number().max(50).default(10),
                page: z.number().default(1),
                offset: z.number().default(0),
                searchQuery: z.string().optional(),
                filters: z.string().optional(),
                article: z.string().optional(),
                toolId: z.number().optional(),
                protocolId: z.number().optional(),
                workflowId: z.number().optional(),
                useCaseId: z.number().optional(),
            }),
        )
        .query(async ({ input, ctx }) => {
            let dateFrom: Date | null = null;
            let dateTo: Date | null = null;
            let filterTagIds: string[] = [];
            let statusFilter: string | null = null;
            let contentType: string | null = null;

            if (input.filters && typeof input.filters === 'string' && input.filters?.trim() !== '') {
                try {
                    const filters = JSON.parse(input.filters ?? '');

                    if (filters.statusFilter) {
                        statusFilter = filters.statusFilter;
                    }

                    if (filters.type) {
                        contentType = filters.type;
                    }

                    if (filters.dateFilter) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        switch (filters.dateFilter) {
                            case 'today':
                                dateFrom = today;
                                break;
                            case 'thisWeek':
                                const thisWeek = new Date(today);
                                const day = thisWeek.getDay();
                                thisWeek.setDate(thisWeek.getDate() - day);
                                dateFrom = thisWeek;
                                break;
                            case 'thisMonth':
                                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                dateFrom = thisMonth;
                                break;
                        }
                    }

                    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
                        filterTagIds = filters.tags;
                    }
                } catch (e) {
                    void e;
                }
            }

            let orderByClause;
            if (statusFilter === 'popular') {
                orderByClause = desc(dbSchema.Question.createdAt);
            } else {
                orderByClause = desc(dbSchema.Question.createdAt);
            }

            let questionsQuery;
            if (input.searchQuery && input.searchQuery?.trim() !== '') {
                questionsQuery = db
                    .select({
                        id: dbSchema.Question.id,
                        title: dbSchema.Question.question,
                        excerpt: dbSchema.Question.description,
                        resolved: dbSchema.Question.resolved,
                        author: dbSchema.User.name,
                        authorLastName: dbSchema.User.lastName,
                        authorId: dbSchema.User.id,
                        createdAt: dbSchema.Question.createdAt,
                        relatedArticle: dbSchema.Question.relatedArticle,
                        relatedTool: dbSchema.Question.relatedTool,
                        relatedProtocol: dbSchema.Question.relatedProtocol,
                        relatedWorkflow: dbSchema.Question.relatedWorkflow,
                        relatedUseCase: dbSchema.Question.relatedUseCase,
                        type: dbSchema.Question.type,
                        clinicalUnit: dbSchema.Question.clinicalUnit,
                        region: dbSchema.Question.region,
                        additionalInfo: dbSchema.Question.additionalInfo,
                        studyType: dbSchema.Question.studyType,
                        sampleSize: dbSchema.Question.sampleSize,
                        workingHipothesis: dbSchema.Question.workingHipothesis,
                        conclusions: dbSchema.Question.conclusions,
                        authors: dbSchema.Question.authors,
                        journal: dbSchema.Question.journal,
                        doi: dbSchema.Question.doi,
                        abstract: dbSchema.Question.abstract,
                        scope: dbSchema.Question.scope,
                        targetAudience: dbSchema.Question.targetAudience,
                        graphicalAbstract: dbSchema.Question.graphicalAbstract,
                    })
                    .from(dbSchema.Question)
                    .leftJoin(dbSchema.User, eq(dbSchema.Question.idUser, dbSchema.User.id))
                    .where(
                        or(
                            like(dbSchema.Question.question, `%${input.searchQuery}%`),
                            like(dbSchema.Question.description, `%${input.searchQuery}%`)
                        )
                    )
                    .orderBy(orderByClause);
            } else {
                questionsQuery = db
                    .select({
                        id: dbSchema.Question.id,
                        title: dbSchema.Question.question,
                        excerpt: dbSchema.Question.description,
                        resolved: dbSchema.Question.resolved,
                        author: dbSchema.User.name,
                        authorLastName: dbSchema.User.lastName,
                        authorId: dbSchema.User.id,
                        createdAt: dbSchema.Question.createdAt,
                        relatedArticle: dbSchema.Question.relatedArticle,
                        relatedTool: dbSchema.Question.relatedTool,
                        relatedProtocol: dbSchema.Question.relatedProtocol,
                        relatedWorkflow: dbSchema.Question.relatedWorkflow,
                        relatedUseCase: dbSchema.Question.relatedUseCase,
                        type: dbSchema.Question.type,
                        clinicalUnit: dbSchema.Question.clinicalUnit,
                        region: dbSchema.Question.region,
                        additionalInfo: dbSchema.Question.additionalInfo,
                        studyType: dbSchema.Question.studyType,
                        sampleSize: dbSchema.Question.sampleSize,
                        workingHipothesis: dbSchema.Question.workingHipothesis,
                        conclusions: dbSchema.Question.conclusions,
                        authors: dbSchema.Question.authors,
                        journal: dbSchema.Question.journal,
                        doi: dbSchema.Question.doi,
                        abstract: dbSchema.Question.abstract,
                        scope: dbSchema.Question.scope,
                        targetAudience: dbSchema.Question.targetAudience,
                        graphicalAbstract: dbSchema.Question.graphicalAbstract,
                    })
                    .from(dbSchema.Question)
                    .leftJoin(dbSchema.User, eq(dbSchema.Question.idUser, dbSchema.User.id))
                    .orderBy(orderByClause);
            }

            const rawQuestions = await questionsQuery;

            let filteredQuestions = rawQuestions;

            if (contentType) {
                filteredQuestions = filteredQuestions.filter(q => q.type === contentType);
            }

            if (dateFrom) {
                filteredQuestions = filteredQuestions.filter(q =>
                    q.createdAt && new Date(q.createdAt) >= dateFrom
                );
            }
            if (dateTo) {
                filteredQuestions = filteredQuestions.filter(q =>
                    q.createdAt && new Date(q.createdAt) <= (dateTo as Date)
                );
            }
            if (input.article) {
                filteredQuestions = filteredQuestions.filter(q => q.relatedArticle === String(input.article));
            }
            if (input.toolId) {
                filteredQuestions = filteredQuestions.filter(q => q.relatedTool === Number(input.toolId));
            }
            if (input.protocolId) {
                filteredQuestions = filteredQuestions.filter(q => q.relatedProtocol === Number(input.protocolId));
            }
            if (input.workflowId) {
                filteredQuestions = filteredQuestions.filter(q => q.relatedWorkflow === Number(input.workflowId));
            }
            if (input.useCaseId) {
                filteredQuestions = filteredQuestions.filter(q => q.relatedUseCase === Number(input.useCaseId));
            }


            const questionIds = filteredQuestions.map(q => q.id);

            if (questionIds.length === 0) {
                return {
                    questions: [],
                    totalPages: 0,
                    currentPage: input.page,
                    totalCount: 0
                };
            }

            const allTags = await db
                .select({
                    idQuestion: dbSchema.QuestionTag.idQuestion,
                    idTag: dbSchema.QuestionTag.idTag,
                    tag: dbSchema.Tag.tag,
                    tagId: dbSchema.Tag.id
                })
                .from(dbSchema.QuestionTag)
                .innerJoin(
                    dbSchema.Tag,
                    eq(dbSchema.QuestionTag.idTag, dbSchema.Tag.id)
                )
                .where(inArray(dbSchema.QuestionTag.idQuestion, questionIds));

            const tagsByQuestion = allTags.reduce((acc, curr) => {
                const questionId = curr.idQuestion!.toString();
                if (!acc[questionId]) {
                    acc[questionId] = [];
                }
                acc[questionId].push({ id: curr.tagId.toString(), tag: curr.tag ?? '' });
                return acc;
            }, {} as Record<string, { id: string; tag: string }[]>);

            let tagFilteredQuestions = filteredQuestions;
            if (filterTagIds.length > 0) {
                tagFilteredQuestions = filteredQuestions.filter(question => {
                    const questionTags = tagsByQuestion[question.id] || [];
                    const questionTagIds = questionTags.map(t => t.tag);
                    return filterTagIds.every(tagId => questionTagIds.includes(tagId));
                });
            }

            const questionsWithData = await Promise.all(
                tagFilteredQuestions.map(async (question) => {
                    const countComments = await db
                        .select({
                            count: sql<number>`count(*)`,
                        })
                        .from(dbSchema.CommentQuestion)
                        .where(eq(dbSchema.CommentQuestion.idQuestion, question.id))
                        .limit(1);

                    const countVotes = await db
                        .select({
                            count: sql<number>`count(*)`,
                        })
                        .from(dbSchema.VoteQuestion)
                        .where(eq(dbSchema.VoteQuestion.idQuestion, question.id))
                        .limit(1);

                    return {
                        ...question,
                        tags: tagsByQuestion[question.id] || [],
                        answers: countComments?.[0]?.count ?? 0,
                        votes: countVotes?.[0]?.count ?? 0,
                        comments: countComments?.[0]?.count ?? 0,
                    };
                })
            );

            let filteredQuestionsWithData;
            if (statusFilter === 'unanswered') {
                filteredQuestionsWithData = questionsWithData.filter(q => q.answers === 0);
            }
            else if (statusFilter === 'resolved') {
                filteredQuestionsWithData = questionsWithData.filter(q => q.resolved === 'yes');
            }
            else if (statusFilter === 'popular') {
                filteredQuestionsWithData = questionsWithData.sort((a, b) => b.votes - a.votes);
            } else {
                filteredQuestionsWithData = questionsWithData;
            }

            const totalFilteredCount = filteredQuestionsWithData.length;
            const totalPages = Math.ceil(totalFilteredCount / input.limit);
            const offset = (input.page - 1) * input.limit + input.offset;

            const paginatedQuestions = filteredQuestionsWithData.slice(offset, offset + input.limit);

            return {
                questions: paginatedQuestions,
                totalPages,
                currentPage: input.page,
                totalCount: totalFilteredCount
            };
        }),

    markQuestionAsResolved: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            if (!ctx.user) {
                return {
                    ok: false,
                };
            }

            const question = await db.select()
                .from(dbSchema.Question)
                .where(eq(dbSchema.Question.id, input.id))
                .limit(1)
                .then((res) => res[0] as { idUser: number | undefined } | undefined);

            if (!question || question.idUser === undefined || question.idUser !== ctx.user.id) {
                return {
                    ok: false,
                };
            }

            await db.update(dbSchema.Question)
                .set({
                    resolved: "yes",
                })
                .where(eq(dbSchema.Question.id, input.id));

            return {
                ok: true,
            };
        }),

    unmarkQuestionAsResolved: authProcedure
        .input(
            z.object({
                id: z.number(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            if (!ctx.user) {
                return {
                    ok: false,
                }
            }

            const question = await db.select().from(dbSchema.Question).where(eq(dbSchema.Question.id, input.id)).limit(1).then((res) => res[0] as { idUser: number | undefined })

            if (!question || question.idUser === undefined || question.idUser !== ctx.user.id) {
                return {
                    ok: false,
                }
            }

            await db.update(dbSchema.Question).set({
                resolved: "no",
            }).where(eq(dbSchema.Question.id, input.id))

            return {
                ok: true,
            }
        }),

    getPopularTags: publicProcedure
        .query(async () => {
            const tags = await db
                .select({
                    tag: dbSchema.Tag.tag,
                    count: sql<number>`count(*)`,
                })
                .from(dbSchema.QuestionTag)
                .innerJoin(dbSchema.Tag, eq(dbSchema.QuestionTag.idTag, dbSchema.Tag.id))
                .groupBy(dbSchema.Tag.tag)
                .orderBy(desc(sql<number>`count(*)`))
                .limit(7);

            return {
                ok: true,
                tags: tags
            }
        }),

    getExperts: publicProcedure
        .query(async () => {
            const questionCounts = await db
                .select({
                    userId: dbSchema.User.id,
                    name: dbSchema.User.name,
                    lastName: dbSchema.User.lastName,
                    typeSpecialist: dbSchema.User.typeSpecialist,
                    count: sql<number>`count(*) as question_count`,
                })
                .from(dbSchema.Question)
                .innerJoin(dbSchema.User, eq(dbSchema.Question.idUser, dbSchema.User.id))
                .groupBy(dbSchema.User.id, dbSchema.User.name);

            const commentCounts = await db
                .select({
                    userId: dbSchema.User.id,
                    name: dbSchema.User.name,
                    lastName: dbSchema.User.lastName,
                    typeSpecialist: dbSchema.User.typeSpecialist,
                    count: sql<number>`count(*) as comment_count`,
                })
                .from(dbSchema.CommentQuestion)
                .innerJoin(dbSchema.User, eq(dbSchema.CommentQuestion.idUser, dbSchema.User.id))
                .groupBy(dbSchema.User.id, dbSchema.User.name);

            const userCounts = new Map();

            questionCounts.forEach(item => {
                userCounts.set(item.userId, {
                    userId: item.userId,
                    name: item.name,
                    lastName: item.lastName,
                    typeSpecialist: item.typeSpecialist,
                    count: item.count
                });
            });

            commentCounts.forEach(item => {
                if (userCounts.has(item.userId)) {
                    const existing = userCounts.get(item.userId);
                    userCounts.set(item.userId, {
                        userId: item.userId,
                        name: item.name,
                        lastName: item.lastName,
                        typeSpecialist: item.typeSpecialist,
                        count: existing.count + item.count
                    });
                } else {
                    userCounts.set(item.userId, {
                        userId: item.userId,
                        name: item.name,
                        lastName: item.lastName,
                        typeSpecialist: item.typeSpecialist,
                        count: item.count
                    });
                }
            });

            const experts = Array.from(userCounts.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            return {
                ok: true,
                experts: experts
            }
        }),
    getImage: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            const { id } = input
            const file = await db
                .select({ document: dbSchema.Question.graphicalAbstract })
                .from(dbSchema.Question)
                .where(eq(dbSchema.Question.id, id))
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

})