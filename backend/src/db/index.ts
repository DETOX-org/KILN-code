import "dotenv/config";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

export const db = drizzle({
    client: pool,
});