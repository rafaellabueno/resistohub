
import { publicProcedure, router } from "../trpc"
import { db, dbSchema } from "../../db"
import { eq, isNotNull, sql, and, desc } from "drizzle-orm"

export const statsRouter = router({
    getStats: publicProcedure.query(async () => {
        const [{ totalUsers }] = await db
            .select({ totalUsers: sql<number>`count(*)` })
            .from(dbSchema.User)

        const [{ totalQuestions }] = await db
            .select({ totalQuestions: sql<number>`count(*)` })
            .from(dbSchema.Question)

        const [{ totalTools }] = await db
            .select({ totalTools: sql<number>`count(*)` })
            .from(dbSchema.Tool)

        const [{ totalProtocols }] = await db
            .select({ totalProtocols: sql<number>`count(*)` })
            .from(dbSchema.Protocol)

        return {
            ok: true,
            totalUsers: totalUsers,
            totalQuestions: totalQuestions,
            totalTools: totalTools,
            totalProtocols: totalProtocols,
        }
    }),
    getUserProfile: publicProcedure.query(async ({ ctx }) => {
        const byCountry = await db
            .select({
                name: dbSchema.User.country,
                value: sql<number>`count(*)`,
            })
            .from(dbSchema.User)
            .groupBy(dbSchema.User.country)
            .where(and(
                eq(dbSchema.User.status, "active"),
                isNotNull(dbSchema.User.country))
            )
            .orderBy(desc(sql<number>`count(*)`))

        const byInstitution = await db
            .select({
                name: dbSchema.User.institution,
                value: sql<number>`count(*)`,
            })
            .from(dbSchema.User)
            .groupBy(dbSchema.User.institution)
            .where(and(
                eq(dbSchema.User.status, "active"),
                isNotNull(dbSchema.User.institution))
            )
            .orderBy(desc(sql<number>`count(*)`))
            .limit(10)

        const bySpecialist = await db
            .select({
                name: dbSchema.User.typeSpecialist,
                value: sql<number>`count(*)`,
            })
            .from(dbSchema.User)
            .groupBy(dbSchema.User.typeSpecialist)
            .where(and(
                eq(dbSchema.User.status, "active"),
                isNotNull(dbSchema.User.typeSpecialist))
            )
            .orderBy(desc(sql<number>`count(*)`))

        return {
            ok: true,
            byCountry: byCountry,
            byInstitution: byInstitution,
            bySpecialist: bySpecialist,
        }
    }),
})