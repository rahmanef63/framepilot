import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, isAdminUser } from "./lib";

// Cheap gate the client can call to show/hide admin UI. The real protection is
// requireAdmin on the data queries below — this is UX only.
export const isAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => isAdminUser(ctx),
});

// App-wide counters. Admin-only.
export const stats = query({
  args: {},
  returns: v.object({ userCount: v.number(), projectCount: v.number() }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").take(2000);
    const projects = await ctx.db.query("projects").take(5000);
    return { userCount: users.length, projectCount: projects.length };
  },
});

// Every user + their saved-project count. Admin-only.
export const listUsers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      email: v.union(v.string(), v.null()),
      name: v.union(v.string(), v.null()),
      createdAt: v.number(),
      projectCount: v.number(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").order("desc").take(200);
    // ponytail: per-user project count is N+1 but bounded (admin view, few users);
    // move to a denormalised counter if the user base ever gets large.
    return await Promise.all(
      users.map(async (u) => {
        const projs = await ctx.db
          .query("projects")
          .withIndex("by_user", (q) => q.eq("userId", u._id))
          .take(500);
        return {
          _id: u._id,
          email: u.email ?? null,
          name: u.name ?? null,
          createdAt: u._creationTime,
          projectCount: projs.length,
        };
      }),
    );
  },
});
