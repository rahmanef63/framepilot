import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUser } from "./lib";

// Upsert the signed-in user's project by name (mirrors the localStorage save-by-name).
// ponytail: `doc` is the whole EditorProject JSON incl. jpeg thumbs — a huge project can
// approach Convex's 1MB doc limit; strip thumbs before save if that ceiling is ever hit.
export const save = mutation({
  args: { name: v.string(), doc: v.string() },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const name = args.name.slice(0, 200) || "Proyek";
    // bounded scan of the caller's own projects (a user has few) — no bare .collect()
    const mine = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(200);
    const existing = mine.find((p) => p.name === name);
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { doc: args.doc, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("projects", { userId, name, doc: args.doc, updatedAt: now });
  },
});

// List the caller's saved projects (metadata only). Graceful [] for anonymous callers so
// a broadly-mounted query never throws.
export const listMine = query({
  args: {},
  returns: v.array(
    v.object({ _id: v.id("projects"), name: v.string(), updatedAt: v.number() }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const mine = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    return mine.map((p) => ({ _id: p._id, name: p.name, updatedAt: p.updatedAt }));
  },
});

// Fetch one project's serialized doc. Owner-scoped; null if not found / not the owner.
export const get = query({
  args: { id: v.id("projects") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const p = await ctx.db.get(args.id);
    if (!p || p.userId !== userId) return null;
    return p.doc;
  },
});

// Delete one of the caller's projects. Owner-scoped.
export const remove = mutation({
  args: { id: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const p = await ctx.db.get(args.id);
    if (!p || p.userId !== userId) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Project not found" });
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
