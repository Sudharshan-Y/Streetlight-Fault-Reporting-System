import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Stateless-first: the Streetlight app runs fully client-side (localStorage)
// so DATABASE_URL is OPTIONAL. This keeps `next build` + Vercel deploys
// working with zero env vars, while still supporting Postgres if configured.
const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function getPool(): Pool | null {
  if (!databaseUrl) return null;
  if (globalForDb.__arenaNextJsPostgresqlPool) return globalForDb.__arenaNextJsPostgresqlPool;
  const pool = new Pool({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
  return pool;
}

export const pool = databaseUrl ? getPool() : null;
export const db: ReturnType<typeof drizzle> | null = pool ? drizzle(pool) : null;
export const isDbConfigured = Boolean(databaseUrl);
