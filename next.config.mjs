/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // A per-build id, baked into BOTH the client bundle and the /api/build-id route at
  // build time. The client compares its baked id against the running server's id; after
  // a deploy they diverge → the "new version" toast.
  //   MUST be a single value shared by the client + server compile passes. Do NOT use
  //   Date.now() here — next.config is evaluated once PER webpack pass, so Date.now()
  //   would bake a different id into client vs server and fire the toast on every load.
  //   The real id is injected ONCE via the env var by the Dockerfile build step
  //   (NEXT_PUBLIC_BUILD_ID=$(date +%s) npm run build); a constant env value is read
  //   identically by both passes. Local/dev builds (no env) get the stable "dev" literal
  //   → client == server → no false toast.
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev",
  },
};

export default nextConfig;
