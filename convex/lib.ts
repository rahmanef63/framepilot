import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";

// Throw-on-missing: first line of every write handler (rr: server-side authz).
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError({ code: "NOT_AUTHORIZED", message: "Not authenticated" });
  return userId;
}

// Admin allowlist — comma-separated emails in the ADMIN_EMAILS Convex env var
// (server-side only; NEVER shipped to the client bundle). Empty = no admins.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** True if the current caller's email is on the admin allowlist. Never throws. */
export async function isAdminUser(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  const email = user?.email?.toLowerCase();
  return !!email && adminEmails().includes(email);
}

/** First line of every admin-only handler. Throws unless the caller is an admin. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await requireUser(ctx);
  const user = await ctx.db.get(userId);
  const email = user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) {
    throw new ConvexError({ code: "NOT_AUTHORIZED", message: "Admin only" });
  }
  return userId;
}
