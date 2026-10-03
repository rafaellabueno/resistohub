import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"

const uri = process.env.DATABASE_URI
const connection = mysql.createPool({
  uri,
  connectionLimit: 20,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 10000,
})

export const db = drizzle(connection)
