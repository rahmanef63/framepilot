// @convex-dev/auth needs this to refresh the auth token and expose session state to the app.
// TODO(rr): rr wants proxy.ts (Next 16 rename). DEFERRED on purpose: middleware.ts still works
// in 16 (deprecated, edge runtime), whereas proxy.ts forces the Node.js runtime where
// @convex-dev/auth has an open token-refresh bug (get-convex/convex-auth#271: "No tokens to
// refresh" / isAuthenticated:false). Compliant version = rename to src/proxy.ts once that fix
// lands + the auth flow is re-verified live. Keeping middleware.ts preserves working auth.
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

export default convexAuthNextjsMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
