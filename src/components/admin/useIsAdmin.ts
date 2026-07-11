"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * useIsAdmin — cheap UX gate for admin surfaces.
 *
 * Returns:
 *   undefined → still loading (query in flight)
 *   false     → signed-in but not an admin
 *   true      → admin (ADMIN_EMAILS on the server)
 *
 * This is UX only. The real protection is `requireAdmin` on the data
 * queries (stats / listUsers), which throw for non-admins regardless of
 * what the client renders. Consumers (this route + the Sidebar nav entry)
 * use it to decide whether to *show* admin affordances at all.
 */
export function useIsAdmin(): boolean | undefined {
  return useQuery(api.admin.isAdmin);
}
