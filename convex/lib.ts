import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Throw-on-missing: first line of every write handler (rr: server-side authz).
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError({ code: "NOT_AUTHORIZED", message: "Not authenticated" });
  return userId;
}
