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
});
