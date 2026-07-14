/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // A per-build id, baked into BOTH the client bundle and the server at build time.
  // The client compares its baked id against /api/build-id (the running server's id);
  // after a deploy the ids diverge → the "new version" toast. Date.now() runs once
  // per `next build`, so every deploy gets a fresh id (override via env in CI if ever).
  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.NEXT_PUBLIC_BUILD_ID ?? Date.now().toString(36),
  },
};

export default nextConfig;
