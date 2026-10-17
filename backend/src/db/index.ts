import "dotenv/config";

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

const isLocalhost =
    databaseUrl.includes("localhost") ||
    databaseUrl.includes("127.0.0.1") ||
    databaseUrl.includes("@db:");

const useSsl =
    !isLocalhost &&
    (databaseUrl.includes("sslmode=") ||
     databaseUrl.includes(".render.com") ||
     databaseUrl.includes(".neon.tech") ||
     databaseUrl.includes(".supabase.co") ||
     process.env.NODE_ENV === "production");

export const pool = new Pool({
    connectionString: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});

export const db = drizzle({
    client: pool,
});