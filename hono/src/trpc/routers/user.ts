import { and, eq, not, sql } from "drizzle-orm"
import { z } from "zod"
import { db, dbSchema } from "../../db"
import {
  adminProcedure,
  authProcedure,
  publicProcedure,
  router,
} from "../trpc"
import { TRPCError } from "@trpc/server"
import { schemas } from "../../../../sharedItems/schemas/zodSchemas"
import { serverContent } from "../../language/server"
import axios from 'axios'

export const userRouter = router({
  getProfiles: authProcedure.query(async ({ ctx }) => {
    const profs = await db
      .select({
        profile: dbSchema.Profile.profile,
      })
      .from(dbSchema.Profile)
      .where(eq(dbSchema.Profile.idUser, ctx.user.id))

    return profs
  }),
  getUsersByProfile: adminProcedure
    .input(z.enum(["client", "admin"]))
    .query(async ({ input }) => {
      type ProfileType = "admin" | "client"
      let profileLevels: ProfileType[] = []

      switch (input) {
        case "admin":
          profileLevels = ["admin"]
          break
        default:
          profileLevels = ["admin", "client"]
          break
      }
      function getProfileLevel(profile: string): number {
        switch (profile) {
          case "admin":
            return 4
          case "client":
            return 1
          default:
            return 0 // Or throw an error
        }
      }

      const subquery = db
        .select({
          userId: dbSchema.Profile.idUser,
          maxProfile: sql<string>`MAX(
        CASE
          WHEN ${dbSchema.Profile.profile} = 'admin' THEN 4
          WHEN ${dbSchema.Profile.profile} = 'client' THEN 1
          ELSE 0 -- Handle unknown profiles
        END
      )`.as("maxProfile"),
        })
        .from(dbSchema.Profile)
        .groupBy(dbSchema.Profile.idUser)
        .as("subquery")

      return db
        .select({
          user: {
            id: dbSchema.User.id,
            name: dbSchema.User.name,
            lastName: dbSchema.User.lastName,
            email: dbSchema.User.email,
          },
        })
        .from(dbSchema.User)
        .innerJoin(subquery, eq(dbSchema.User.id, subquery.userId))
        .where(
          and(
            eq(subquery.maxProfile, getProfileLevel(input).toString()),
            eq(dbSchema.User.status, "active"),
          ),
        )
    }),
  changeLang: authProcedure
    .input(z.enum(["en-us", "pt-br", "es-es"]))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(dbSchema.User)
        .set({ lang: input })
        .where(eq(dbSchema.User.id, ctx.user.id))
      // change cookie
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      ctx.resHeaders.set(
        "Set-Cookie",
        `NEXT_LOCALE=${input}; Path=/; Expires=${expiresAt.toUTCString()}; SameSite=Lax; Secure; Domain=${process.env.DOMAIN}`,
      )
      return { ok: true }
    }),
  changeLangPublic: publicProcedure
    .input(z.enum(["en-us", "pt-br", "es-es"]))
    .mutation(async ({ ctx, input }) => {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      ctx.resHeaders.set(
        "Set-Cookie",
        `NEXT_LOCALE=${input}; Path=/; Expires=${expiresAt.toUTCString()}; SameSite=Lax; Secure; Domain=${process.env.DOMAIN}`,
      )
      return { ok: true }
  }),
  getUser: publicProcedure
  .input(
    z.object({
      id: z.number(),
    }),
  )
  .query(async ({ input }) => {
    const user = await db
      .select({
        id: dbSchema.User.id,
        name: dbSchema.User.name,
        description: dbSchema.User.description,
        lastName: dbSchema.User.lastName,
        email: dbSchema.User.email,
        lang: dbSchema.User.lang,
        country: dbSchema.User.country,
        institution: dbSchema.User.institution,
        typeSpecialist: dbSchema.User.typeSpecialist,
        createdAt: dbSchema.User.createdAt,
        updatedAt: dbSchema.User.updatedAt,
        position: dbSchema.User.position,
      })
      .from(dbSchema.User)
      .where(eq(dbSchema.User.id, input.id))
      .limit(1)
      .then((res) => res[0])

    if (!user) {
      return null
    }

    const countAnswers = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(dbSchema.CommentQuestion)
      .where(eq(dbSchema.CommentQuestion.idUser, input.id))
      .limit(1)

    return {
      ...user,
      answers: countAnswers?.[0]?.count ?? 0,
    }
  }),  

})
