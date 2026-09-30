import { db } from "./index.js";
import { sql } from "drizzle-orm";

async function testConnection(): Promise<void> {
    try {
        const result = await db.execute(
            sql`SELECT current_database() AS database, version() AS version`,
        );

        console.log("✅ PostgreSQL connection successful");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("❌ PostgreSQL connection failed");
        console.error(error);
        process.exitCode = 1;
    }
}

testConnection();