export const dynamic = "force-dynamic";

export async function GET() {
  // Stateless healthcheck — passes with or without DATABASE_URL so the
  // app deploys on Vercel with zero config (client-side storage mode).
  return Response.json({
    ok: true,
    app: "lumina-track PRJ-118",
    mode: process.env.DATABASE_URL ? "postgres-optional" : "stateless-local",
    time: new Date().toISOString(),
  });
}
