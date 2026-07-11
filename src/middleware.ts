// Next 15 keeps the middleware.ts filename (Next 16 renamed it to proxy.ts).
// @convex-dev/auth needs this to refresh the auth token and expose session state to the app.
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

export default convexAuthNextjsMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
