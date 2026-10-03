import { z } from "zod"
// See .env.example for the required environment variables.
// - DATABASE_USERNAME=root
// - DATABASE_HOST=db
// - DATABASE_NAME=mestrado
// - FRONT_URL=http://localhost:4321
// - DOMAIN=.localhost
// - S3_ENDPOINT=http://minio:9000
// - S3_BUCKET=mestrado
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URI: z.string().url(),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_HOST: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  FRONT_URL: z.string().url(),
  DOMAIN: z.string().min(1),
  COOKIE_NAME: z.string().min(1),
  // TODO: remove this
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_ENDPOINT: z.string().url(),
  S3_BUCKET: z.string().min(1),
  S3_PUBLIC_ENDPOINT: z.string().url(),
})

export const validateEnv = () => {
  const validate = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URI: process.env.DATABASE_URI,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_NAME: process.env.DATABASE_NAME,
    FRONT_URL: process.env.FRONT_URL,
    DOMAIN: process.env.DOMAIN,
    COOKIE_NAME: process.env.COOKIE_NAME,
    ENDPOINT: process.env.ENDPOINT,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_PUBLIC_ENDPOINT: process.env.S3_PUBLIC_ENDPOINT,
  })

  if (!validate.success) {
    console.error("❌ Invalid environment variables:")
    console.dir(validate.error.flatten().fieldErrors, 200)
    throw new Error("❌ Invalid environment variables")
  }
}

type env = z.infer<typeof envSchema>

const parsedEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URI: process.env.DATABASE_URI,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_NAME: process.env.DATABASE_NAME,
  FRONT_URL: process.env.FRONT_URL,
  DOMAIN: process.env.DOMAIN,
  COOKIE_NAME: process.env.COOKIE_NAME,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_PUBLIC_ENDPOINT: process.env.S3_PUBLIC_ENDPOINT,
})

export const env = parsedEnv