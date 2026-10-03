import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"
import { and, count, desc, eq, gte, like } from "drizzle-orm"
import { z } from "zod"
import { schemas } from "../../schemas/zodSchemas"
import { auth } from "../../auth"
import { db, dbSchema } from "../../db"
import { ee } from "../../events/events"
import { serverContent } from "../../language/server"
import { sendEmail } from "../../utils/emailService"
import { getCookieHelper } from "../cookieHelper"
import { authProcedure, publicProcedure, router } from "../trpc"
import { formats } from "../../utils/format"

export const authRouter = router({
  signUp: publicProcedure
    .input(schemas.registerSchema)
    .mutation(async ({ ctx, input }) => {
      const time = new Date().getTime()
      const date = new Date(time - 1000 * 60 * 60)

      const [userInfo] = await db
        .select()
        .from(dbSchema.AuthenticatorNumber)
        .where(
          and(
            eq(dbSchema.AuthenticatorNumber.email, input.email),
            eq(dbSchema.AuthenticatorNumber.status, "waiting"),
            gte(dbSchema.AuthenticatorNumber.createdAt, date),
          ),
        )
        .orderBy(desc(dbSchema.AuthenticatorNumber.createdAt))
        .limit(1)

      if (userInfo.authenticatorNumber !== input.code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: serverContent[ctx.lang].auth.resetPassword.invalidCode,
        })
      }
      const hashedPassword = await bcrypt.hash(input.password, 10)

      const [res] = await db
        .select()
        .from(dbSchema.User)
        .where(eq(dbSchema.User.email, input.email))

      if (res) {
        return {
          ok: true,
        }
      }

      const [{ insertId }] = await db.insert(dbSchema.User).values({
        email: input.email,
        hashedPassword: hashedPassword,
        name: input.name,
        lastName: input.lastName,
        status: "active",
        country: input.country,
        institution: input.institution,
        typeSpecialist: input.typeSpecialist,
        description: input.description,
      })

      // @ts-ignore
      const token = auth.generateSessionToken()
      const session = await auth.createSession(token, insertId)
      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        })
      }

      auth.setSessionTokenCookie(ctx.resHeaders, token)
      await db.insert(dbSchema.Profile).values({
        idUser: insertId,
        profile: "client",
      })

      await db
        .update(dbSchema.AuthenticatorNumber)
        .set({ idUser: insertId })
        .where(eq(dbSchema.AuthenticatorNumber.id, userInfo.id))

      return { ok: true }
    }),

  login: publicProcedure.input(schemas.loginSchema).mutation(async ({ ctx, input }) => {
    const [data] = await db
      .select({
        id: dbSchema.User.id,
        hashedPassword: dbSchema.User.hashedPassword,
        status: dbSchema.User.status,
        name: dbSchema.User.name,
      })
      .from(dbSchema.User)
      .where(eq(dbSchema.User.email, input.email))

    // 20 - 200 ms
    const randomTimeout = Math.random() * 100 + 20

    const hashedPassword = data?.hashedPassword ?? ""
    const isValid = await bcrypt.compare(input.password, hashedPassword)

    await Bun.sleep(randomTimeout)

    if (!isValid || data.status !== "active") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: serverContent[ctx.lang].auth.login.userOrPasswordIncorrect,
      })
    }

    //@ts-ignore
    const token = auth.generateSessionToken()
    const session = await auth.createSession(token, data.id)
    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      })
    }

    auth.setSessionTokenCookie(ctx.resHeaders, token)

    const profiles = await db
      .select({
        profile: dbSchema.Profile.profile,
      })
      .from(dbSchema.Profile)
      .where(eq(dbSchema.Profile.idUser, data.id))

    type profileType = "admin" | "client"
    const orderProfile = (profile: profileType | null) => {
      switch (profile) {
        case "admin":
          return 1
        case "client":
          return 4
        default: {
          return 4
        }
      }
    }
    const prof = profiles.reduce((prev, curr) =>
      orderProfile(prev.profile) < orderProfile(curr.profile) ? prev : curr,
    )

    const affected = await db
      .update(dbSchema.User)
      .set({ lang: ctx.lang })
      .where(eq(dbSchema.User.id, data.id))

    const ip =
      ctx.req.headers.get("cf-connecting-ip") ?? ctx.req.headers.get("x-forwarded-for")

    const response = await fetch(`http://ip-api.com/json/${ip}`).catch(
      () => new Error("Erro ao buscar IP"),
    )

    if (response instanceof Error)
      return {
        ok: true,
        profile: prof.profile,
      }

    type JsonType =
      | {
        city: string
        regionName: string
        query: string
      }
      | Error

    const json = (await response
      .json()
      .catch(() => new Error("Error on json converter"))) as JsonType
    if (json instanceof Error) {
      return {
        ok: true,
        profile: prof.profile,
      }
    }

    return { ok: true, profile: prof.profile }
  }),
  logout: authProcedure.mutation(async ({ ctx }) => {
    const token = getCookieHelper(ctx.req, auth.sessionCookieName) ?? ""
    const session = await auth.validateSessionToken(token)

    auth.deleteSessionTokenCookie(ctx.resHeaders)
    if (session.session?.id) {
      await auth.invalidateSession(session.session.id)
    }
    return { ok: true }
  }),
  me: authProcedure.query(async ({ ctx }) => {
    return {
      ...ctx.user,
    }
  }),
  updateUserProfile: authProcedure
    .input(schemas.userProfileSchema)
    .mutation(async ({ input, ctx }) => {
      await db
        .update(dbSchema.User)
        .set({
          name: input.name,
          lastName: input.lastName,
          country: input.country,
          institution: input.institution,
          typeSpecialist: input.typeSpecialist,
          description: input.description,
          position: input.position,
        })
        .where(eq(dbSchema.User.id, ctx.user.id))

      return { ok: true }
    }),
  sendResetPassword: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const [userMail] = await db
        .select()
        .from(dbSchema.User)
        .where(eq(dbSchema.User.email, input))

      if (!userMail) {
        // 1s to 1.5s
        const randomTimeout = Math.floor(Math.random() * (1500 - 1000 + 1) + 1000)
        await Bun.sleep(randomTimeout)
        return { ok: true }
      }

      const { number, numberWithSpaces } = formats.createRandomCode()

      const replacements = {
        code: numberWithSpaces!,
        name: userMail.name ?? input,
      }
      const fileEmail =
        ctx.lang === "en-us" ? "verificationCodeEn" : ctx.lang === "pt-br" ? "verificationCodePt" : "verificationCodeEs"
      const subject =
        ctx.lang === "en-us"
          ? "Verification Code"
          : ctx.lang === "pt-br"
            ? "Código de Verificação"
            : "Código de Verificación"

      ee.emit("sendEmail", {
        email: input,
        subject,
        fileName: fileEmail,
        replacements: replacements,
      })

      await db.insert(dbSchema.AuthenticatorNumber).values({
        idUser: userMail.id,
        email: userMail.email,
        authenticatorNumber: number,
        status: "waiting",
      })

      return { ok: true }
    }),
  sendPasswordRegister: publicProcedure
    .input(schemas.sendCodeSchema)
    .mutation(async ({ ctx, input }) => {
      const { number, numberWithSpaces } = formats.createRandomCode()

      const replacements = {
        code: numberWithSpaces!,
        name: input.name ?? input.email,
      }
      const fileEmail =
        ctx.lang === "en-us" ? "verificationCodeEn" : ctx.lang === "pt-br" ? "verificationCodePt" : "verificationCodeEs"
      const subject =
        ctx.lang === "en-us"
          ? "Verification Code"
          : ctx.lang === "pt-br"
            ? "Código de Verificação"
            : "Código de Verificación"
      const email = await sendEmail(input.email, subject, fileEmail, replacements).catch(
        () => {
          return new Error(serverContent[ctx.lang].sendEmailError)
        },
      )

      if (email instanceof Error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: serverContent[ctx.lang].sendEmailError,
        })
      }

      await db.insert(dbSchema.AuthenticatorNumber).values({
        email: input.email,
        authenticatorNumber: number,
        status: "waiting",
      })

      return { ok: true }
    }),
  changePassword: publicProcedure
    .input(schemas.changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const time = new Date().getTime()
      const date = new Date(time - 1000 * 60 * 60)
      const [userInfo] = await db
        .select()
        .from(dbSchema.AuthenticatorNumber)
        .leftJoin(
          dbSchema.User,
          eq(dbSchema.AuthenticatorNumber.idUser, dbSchema.User.id),
        )
        .where(
          and(
            eq(dbSchema.User.email, input.email),
            eq(dbSchema.AuthenticatorNumber.status, "waiting"),
            gte(dbSchema.AuthenticatorNumber.createdAt, date),
          ),
        )
        .orderBy(desc(dbSchema.AuthenticatorNumber.createdAt))
        .limit(1)

      if (userInfo.authenticator_number.authenticatorNumber !== input.code) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: serverContent[ctx.lang].auth.resetPassword.invalidCode,
        })
      }

      const hashedPassword = await Bun.password.hash(input.password, {
        algorithm: "bcrypt",
      })
      await db.transaction(async (tx) => {
        await tx
          .update(dbSchema.User)
          .set({ hashedPassword: hashedPassword })
          .where(eq(dbSchema.User.id, userInfo.user?.id!))
        await tx
          .update(dbSchema.AuthenticatorNumber)
          .set({ status: "utilized" })
          .where(eq(dbSchema.AuthenticatorNumber.id, userInfo.authenticator_number?.id!))
      })

      return {
        ok: true,
        message: serverContent[ctx.lang].auth.resetPassword.success,
      }
    }),
})
