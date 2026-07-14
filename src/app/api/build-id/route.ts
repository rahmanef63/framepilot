// Reports the RUNNING server's build id (baked at build time via next.config `env`).
// The client polls this and compares to its own baked NEXT_PUBLIC_BUILD_ID; after a
// deploy the running server returns a newer id → the client shows the refresh toast.
// Must never be cached, or a stale id would hide new deploys.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? "unknown" },
    { headers: { "cache-control": "no-store" } }
  );
}
