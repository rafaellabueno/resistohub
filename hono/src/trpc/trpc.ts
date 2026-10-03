/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
/** Replace this with an object if you want to pass things to `createContextInner`. */
/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */

import { TRPCError, type inferAsyncReturnType } from "@trpc/server"

export function createContext(opts: FetchCreateContextFnOptions) {
  const user = undefined
  return { user, ...opts }
}
export type Context = inferAsyncReturnType<typeof createContext>

import { initTRPC } from "@trpc/server"
import { and, eq, or } from "drizzle-orm"
import { auth } from "../auth"
import { dbSchema, db } from "../db"
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
import { serverContent } from "../language/server"
import { getCookieHelper } from "./cookieHelper"

type profileType = "admin" | "client"
type localeType = "en-us" | "pt-br" | "es-es"

const orderProfile = (profile: profileType | null) => {
  switch (profile) {
    case "admin":
      return 1
    case "client":
      return 2
    default: {
      return 2
    }
  }
}

const t = initTRPC.context<typeof createContext>().create({
  errorFormatter({ shape }) {
    return shape
  },
})
const publicMiddleware = t.middleware(async ({ ctx, next }) => {
  const cookieLocale = getCookieHelper(ctx.req, "NEXT_LOCALE") as localeType

  const acceptLanguageHeader = ctx.req.headers.get("accept-language")
  const defaultLang = acceptLanguageHeader?.split(",")[0] || "en-us"

  const nextLocale = (cookieLocale || defaultLang.toLowerCase() || "en-us") as localeType

  return next({ ctx: { ...ctx, lang: nextLocale } })
})
const requireAuth = t.middleware(async ({ ctx, next }) => {
  const token = getCookieHelper(ctx.req, auth.sessionCookieName ?? "") ?? ""
  const session = await auth.validateSessionToken(token)

  const nextLocale = (getCookieHelper(ctx.req, "NEXT_LOCALE") as localeType) ?? "en-us"

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: serverContent[nextLocale].middleware.requireAuth.unauthorized,
    })
  }
  if (!session?.user || !session?.user.id || !session?.user.email) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: serverContent[nextLocale].middleware.requireAuth.unauthorized,
    })
  }

  auth.setSessionTokenCookie(ctx.resHeaders, token)
  const profs = await db
    .select({
      profile: dbSchema.Profile.profile,
    })
    .from(dbSchema.Profile)
    .where(eq(dbSchema.Profile.idUser, Number(session.user.id)))

  const prof = profs.reduce((prev, curr) =>
    orderProfile(prev.profile) < orderProfile(curr.profile) ? prev : curr,
  )

  return next({
    ctx: {
      ...ctx,
      user: {
        id: Number(session.user.id),
        email: session.user.email,
        name: session.user.name,
        lastName: session.user.lastName,
        profile: prof.profile!,
      },
      lang: nextLocale,
    },
  })
})

const isAdmin = requireAuth.unstable_pipe(async ({ ctx, next }) => {
  const [prof] = await db
    .select({
      profile: dbSchema.Profile.profile,
    })
    .from(dbSchema.Profile)
    .where(
      and(
        eq(dbSchema.Profile.idUser, ctx.user.id),
        eq(dbSchema.Profile.profile, "admin"),
      ),
    )

  if (!prof) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: serverContent[ctx.lang].middleware.isProfile.unauthorized,
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: {
        ...ctx.user,
        profile: prof.profile as profileType,
      },
    },
  })
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(publicMiddleware)
export const authProcedure = publicProcedure.use(requireAuth)
export const adminProcedure = publicProcedure.use(isAdmin)
export const router = t.router
