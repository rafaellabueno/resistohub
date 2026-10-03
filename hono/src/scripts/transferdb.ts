import mysql, { type Connection, type ConnectionOptions } from "mysql2/promise"

async function clearAndCopyDatabase(
  targetConfig: ConnectionOptions,
  sourceConfig: ConnectionOptions,
): Promise<void> {
  let targetConnection: Connection | null = null
  let sourceConnection: Connection | null = null

  try {
    // Establish connections
    targetConnection = await mysql.createConnection(targetConfig)
    sourceConnection = await mysql.createConnection(sourceConfig)

    // 1. Delete all tables from the target database
    console.log("Deleting all tables from the target database...")
    const [tables] = await targetConnection.execute<any[]>("SHOW TABLES")
    await targetConnection.execute("SET FOREIGN_KEY_CHECKS = 0")

    for (const tableObj of tables) {
      const tableName = tableObj[Object.keys(tableObj)[0]]
      if (tableName === "user_session") continue
      if (tableName === "withdraw") continue
      if (tableName === "user_settings") continue
      if (tableName === "service_results") continue
      if (tableName === "user") continue
      await targetConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``)
    }
    console.log("All tables deleted from the target database.")

    // 2. Get all tables from the source database
    console.log("Fetching tables from the source database...")
    const [sourceTables] = await sourceConnection.execute<any[]>("SHOW TABLES")

    // 3. Copy tables and data
    console.log("Copying tables and data...")
    await Promise.all(
      sourceTables.map(async (tableObj) => {
        const tableName = tableObj[Object.keys(tableObj)[0]]
        if (tableName === "user_session") return
        if (tableName === "withdraw") return
        if (tableName === "user_settings") return
        if (tableName === "service_results") return
        if (tableName === "user") return
        // Get the CREATE TABLE statement from the source
        const [createTableResult] = await sourceConnection.execute<any[]>(
          `SHOW CREATE TABLE \`${tableName}\``,
        )
        const createTableStatement = createTableResult[0]["Create Table"]

        // Create the table in the target database
        await targetConnection.execute(createTableStatement)

        // Copy data from source to target
        const [rows] = await sourceConnection.execute<any[]>(
          `SELECT * FROM \`${tableName}\``,
        )

        if (rows.length > 0) {
          const columns = Object.keys(rows[0])
            .map((col) => `\`${col}\``)
            .join(", ")

          const values = rows
            .map((row) => {
              return `(${Object.values(row)
                .map((value) => targetConnection!.escape(value))
                .join(", ")})`
            })
            .join(", ")

          const insertStatement = `INSERT INTO \`${tableName}\` (${columns}) VALUES ${values}`
          await targetConnection.execute(insertStatement)
          console.log(`Data copied for table: ${tableName}`)
        }
      }),
    )

    await targetConnection.execute("SET FOREIGN_KEY_CHECKS = 1")
    console.log("All tables and data copied successfully.")
  } catch (error) {
    console.error("An error occurred:", error)
  } finally {
    // Close connections
    if (targetConnection) {
      await targetConnection.end()
    }
    if (sourceConnection) {
      await sourceConnection.end()
    }
    console.log("Connections closed.")
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

// Example usage:
async function main() {
  const targetConfig: ConnectionOptions = {
    host: process.env.TRANSFER_TARGET_DB_HOST ?? "127.0.0.1",
    user: requiredEnv("TRANSFER_TARGET_DB_USER"),
    password: requiredEnv("TRANSFER_TARGET_DB_PASSWORD"),
    database: requiredEnv("TRANSFER_TARGET_DB_NAME"),
    port: Number(process.env.TRANSFER_TARGET_DB_PORT ?? 3308),
  }

  const sourceConfig: ConnectionOptions = {
    host: process.env.TRANSFER_SOURCE_DB_HOST ?? "127.0.0.1",
    user: requiredEnv("TRANSFER_SOURCE_DB_USER"),
    password: requiredEnv("TRANSFER_SOURCE_DB_PASSWORD"),
    database: requiredEnv("TRANSFER_SOURCE_DB_NAME"),
    port: Number(process.env.TRANSFER_SOURCE_DB_PORT ?? 3309),
  }

  await clearAndCopyDatabase(targetConfig, sourceConfig)
}

main().catch(console.error)
