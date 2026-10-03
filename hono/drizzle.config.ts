import { defineConfig } from "drizzle-kit";

const user = process.env.DATABASE_USERNAME as string
const password = process.env.DATABASE_PASSWORD as string
const host = process.env.DATABASE_HOST as string
const database = process.env.DATABASE_NAME ?? "mestrado"
const port = process.env.DATABASE_PORT ?? 3307

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URI || `mysql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@db:3306/${process.env.DATABASE_NAME}`,
  },
});
