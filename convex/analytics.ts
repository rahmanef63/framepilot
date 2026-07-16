import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib";

// Truncate defensively so a public, unauthenticated caller can't store a huge payload.
function trunc(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

// PUBLIC, unauthenticated write. Anonymous random sessionId (localStorage) — no PII, no IP.
// Mutations MAY use Date.now().
export const pageview = mutation({
  args: {
    path: v.string(),
    referrer: v.optional(v.string()),
    locale: v.string(),
    lang: v.optional(v.string()),
    device: v.string(),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("pageviews", {
      path: trunc(args.path, 512),
      referrer: args.referrer !== undefined ? trunc(args.referrer, 512) : undefined,
      locale: trunc(args.locale, 8),
      lang: args.lang !== undefined ? trunc(args.lang, 16) : undefined,
      device: trunc(args.device, 16),
      sessionId: trunc(args.sessionId, 64),
      ts: Date.now(),
    });
    return null;
  },
});

// PUBLIC, unauthenticated write. Same privacy posture as pageview.
export const logError = mutation({
  args: {
    message: v.string(),
    stack: v.optional(v.string()),
    path: v.string(),
    ua: v.optional(v.string()),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("clientErrors", {
      message: trunc(args.message, 512),
      stack: args.stack !== undefined ? trunc(args.stack, 2000) : undefined,
      path: trunc(args.path, 512),
      ua: args.ua !== undefined ? trunc(args.ua, 256) : undefined,
      sessionId: trunc(args.sessionId, 64),
      ts: Date.now(),
    });
    return null;
  },
});

// Admin-only aggregated pageview summary. Queries CANNOT call Date.now() — the caller
// passes sinceTs (computed once on the client) as the window cutoff.
export const summary = query({
  args: { sinceTs: v.optional(v.number()) },
  returns: v.object({
    total: v.number(),
    uniqueSessions: v.number(),
    sinceTs: v.number(),
    byLocale: v.array(v.object({ locale: v.string(), count: v.number() })),
    byDevice: v.array(v.object({ device: v.string(), count: v.number() })),
    topPaths: v.array(v.object({ path: v.string(), count: v.number() })),
    byDay: v.array(v.object({ day: v.string(), count: v.number() })),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const sinceTs = args.sinceTs ?? 0;
    // ponytail: .take(20000) bounds it; denormalise into daily counters if volume ever explodes.
    const rows = await ctx.db
      .query("pageviews")
      .withIndex("by_ts", (q) => q.gte("ts", sinceTs))
      .take(20000);

    const sessions = new Set<string>();
    const localeCounts = new Map<string, number>();
    const deviceCounts = new Map<string, number>();
    const pathCounts = new Map<string, number>();
    const dayCounts = new Map<string, number>();

    for (const r of rows) {
      sessions.add(r.sessionId);
      localeCounts.set(r.locale, (localeCounts.get(r.locale) ?? 0) + 1);
      deviceCounts.set(r.device, (deviceCounts.get(r.device) ?? 0) + 1);
      pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1);
      // new Date(ts).toISOString() is deterministic — allowed in a query.
      const day = new Date(r.ts).toISOString().slice(0, 10);
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }

    const descByCount = <T extends { count: number }>(arr: T[]) =>
      arr.sort((a, b) => b.count - a.count);

    const byLocale = descByCount(
      [...localeCounts].map(([locale, count]) => ({ locale, count })),
    );
    const byDevice = descByCount(
      [...deviceCounts].map(([device, count]) => ({ device, count })),
    );
    const topPaths = descByCount(
      [...pathCounts].map(([path, count]) => ({ path, count })),
    ).slice(0, 15);
    const byDay = [...dayCounts]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));

    return {
      total: rows.length,
      uniqueSessions: sessions.size,
      sinceTs,
      byLocale,
      byDevice,
      topPaths,
      byDay,
    };
  },
});

// Admin-only recent client errors (list view drops stack/ua).
export const recentErrors = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("clientErrors"),
      message: v.string(),
      path: v.string(),
      ts: v.number(),
      sessionId: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("clientErrors")
      .withIndex("by_ts")
      .order("desc")
      .take(Math.min(args.limit ?? 30, 200));
    return rows.map((r) => ({
      _id: r._id,
      message: r.message,
      path: r.path,
      ts: r.ts,
      sessionId: r.sessionId,
    }));
  },
});
