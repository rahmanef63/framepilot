import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// authTables = users, authAccounts, authSessions, … (from @convex-dev/auth).
export default defineSchema({
  ...authTables,

  // One saved camera-angle-guide/v2 project per (user, name). `doc` is the serialized
  // EditorProject JSON (same shape the editor exports/imports) — cloud sync of the
  // localStorage autosave for signed-in users. Anonymous users stay on localStorage.
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    doc: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // First-party, privacy-clean analytics. No PII, no IP — just an anonymous random
  // sessionId (localStorage) plus coarse device/locale. Public unauth writes are
  // truncated defensively in the mutation so a caller can't store huge payloads.
  pageviews: defineTable({
    path: v.string(),
    referrer: v.optional(v.string()),
    locale: v.string(),
    lang: v.optional(v.string()),
    device: v.string(),
    sessionId: v.string(),
    ts: v.number(),
  }).index("by_ts", ["ts"]),

  // Client-side error reports. Admin-read only (see analytics.recentErrors).
  clientErrors: defineTable({
    message: v.string(),
    stack: v.optional(v.string()),
    path: v.string(),
    ua: v.optional(v.string()),
    sessionId: v.string(),
    ts: v.number(),
  }).index("by_ts", ["ts"]),
});
