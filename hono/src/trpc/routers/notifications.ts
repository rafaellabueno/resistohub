import { db, dbSchema } from "../../db"
import { and, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { authProcedure, router } from "../trpc"

type NotificationJson = {
  texts: {
    "pt-br": string
    "en-us": string
    "es-es": string
  }
  links?: {
    link: string
    titles: {
      "pt-br": string
      "en-us": string
      "es-es": string
    }
  }[]
}

export const notificationsRouter = router({
  getNotifications: authProcedure
    .input(
      z.object({
        status: z.enum(["all", "read", "unread"]).default("all"),
        limit: z.number().max(50).default(10),
        page: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = input.page * input.limit
      const [nots, [total], [totalNotRead]] = await Promise.all([
        db
          .select()
          .from(dbSchema.Notification)
          .where(
            and(
              eq(dbSchema.Notification.idUser, ctx.user.id),
              input.status === "all"
                ? undefined
                : eq(dbSchema.Notification.status, input.status),
            ),
          )
          .limit(input.limit)
          .orderBy(desc(dbSchema.Notification.id))
          .offset(offset),
        db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(dbSchema.Notification)
          .where(
            and(
              eq(dbSchema.Notification.idUser, ctx.user.id),
              input.status === "all"
                ? undefined
                : eq(dbSchema.Notification.status, input.status),
            ),
          ),
        db
          .select({
            count: sql<number>`count(*)`,
          })
          .from(dbSchema.Notification)
          .where(
            and(
              eq(dbSchema.Notification.idUser, ctx.user.id),
              eq(dbSchema.Notification.status, "unread"),
            ),
          ),
      ])
      return {
        currentPage: input.page,
        totalPages: Math.ceil(Number(total?.count ?? 0) / input.limit),
        notifications: nots.map((not) => ({
          ...not,
          json: JSON.parse(not.json as string) as NotificationJson,
        })),
        totalNotRead: totalNotRead?.count ?? 0,
        total: total?.count ?? 0,
      }
    }),

  createNotification: authProcedure.mutation(async ({ ctx }) => {
    const test = {
      "en-us": {
        title: "teste",
        message: "this is a test",
      },
      "pt-br": {
        title: "teste",
        message: "isso é um teste",
      },
      "es-es": {
        title: "teste",
        message: "esto es un test",
      },
    }
    const [{ insertId }] = await db.insert(dbSchema.Notification).values({
      idUser: ctx.user.id,
      json: JSON.stringify(test),
    })

    return { ok: true, id: insertId }
  }),
  getNotification: authProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const [not] = await db
      .select()
      .from(dbSchema.Notification)
      .where(
        and(
          eq(dbSchema.Notification.id, input),
          eq(dbSchema.Notification.idUser, ctx.user.id),
        ),
      )

    if (!not) {
      return null
    }
    if (not.status === "unread") {
      await db
        .update(dbSchema.Notification)
        .set({ status: "read" })
        .where(eq(dbSchema.Notification.id, input))
    }

    return {
      ...not,
      json: JSON.parse(not.json as string) as NotificationJson,
    }
  }),

  markAllAsRead: authProcedure.mutation(async ({ ctx }) => {
    await db
      .update(dbSchema.Notification)
      .set({ status: "read" })
      .where(eq(dbSchema.Notification.idUser, ctx.user.id))

    return { ok: true }
  }),
  markNotificationAsRead: authProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(dbSchema.Notification)
        .set({ status: "read" })
        .where(eq(dbSchema.Notification.id, input.id))

      return { ok: true }
    }),
})
