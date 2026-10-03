import { db, dbSchema } from "./db"
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { eq, type InferSelectModel } from "drizzle-orm"
// @ts-ignore
export type SessionValidationResult =
  | { session: SessionType; user: UserType }
  | { session: null; user: null }

const TOKEN = process.env.COOKIE_NAME
const DOMAIN = process.env.DOMAIN
export type UserType = InferSelectModel<typeof dbSchema.User>
export type SessionType = InferSelectModel<typeof dbSchema.Session>

function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

async function createSession(token: string, userId: number): Promise<SessionType> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: SessionType = {
    id: sessionId,
    idUser: userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  }
  await db.insert(dbSchema.Session).values(session)
  return session
}

async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const result = await db
    .select({
      user: dbSchema.User,
      session: dbSchema.Session,
    })
    .from(dbSchema.Session)
    .innerJoin(dbSchema.User, eq(dbSchema.Session.idUser, dbSchema.User.id))
    .where(eq(dbSchema.Session.id, sessionId))
  if (result.length < 1) {
    return { session: null, user: null }
  }
  const { user, session } = result[0]
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(dbSchema.Session).where(eq(dbSchema.Session.id, session.id))
    return { session: null, user: null }
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(dbSchema.Session)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(dbSchema.Session.id, session.id))
  }
  return { session, user }
}

async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(dbSchema.Session).where(eq(dbSchema.Session.id, sessionId))
}
function setSessionTokenCookie(headers: Headers, token: string): void {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  if (process.env.NODE_ENV !== "development") {
    // When deployed over HTTPS
    headers.set(
      "Set-Cookie",
      `${TOKEN}=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/; Secure; Domain=${DOMAIN};`,
    )
  } else {
    // When deployed over HTTP (localhost)
    headers.set(
      "Set-Cookie",
      `${TOKEN}=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/`,
    )
  }
}

function deleteSessionTokenCookie(headers: Headers): void {
  if (process.env.NODE_ENV !== "development") {
    // When deployed over HTTPS
    headers.set(
      "Set-Cookie",
      `${TOKEN}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure; Domain=${DOMAIN};`,
    )
  } else {
    // When deployed over HTTP (localhost)
    headers.set("Set-Cookie", `${TOKEN}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`)
  }
}

export const auth = {
  invalidateSession,
  validateSessionToken,
  createSession,
  generateSessionToken,
  sessionCookieName: TOKEN,
  setSessionTokenCookie,
  deleteSessionTokenCookie,
}
