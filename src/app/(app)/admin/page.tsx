"use client";

import React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { useIsAdmin } from "@/components/admin/useIsAdmin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useT } from "@/i18n";

/** Centered notice card — reused for the various not-allowed / loading states. */
function NoticeCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ width: "100%", maxWidth: "460px", margin: "56px auto 0" }}>
      <div
        style={{
          padding: "26px 24px",
          borderRadius: "var(--radius-lg)",
          border: "var(--border-width) solid var(--border)",
          background: "var(--card)",
          boxShadow: "var(--shadow-xs)",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, font: "800 17px var(--font-sans)", color: "var(--foreground)" }}>{title}</h1>
        <p style={{ marginTop: "8px", font: "400 13px var(--font-sans)", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          {body}
        </p>
      </div>
    </div>
  );
}

/**
 * Signed-in branch. Resolves the admin gate before touching any admin data.
 *   undefined → still loading
 *   false     → not an admin: show a notice, never mount AdminDashboard
 *   true      → mount AdminDashboard (which issues the admin-only queries)
 */
function AdminGate() {
  const { t } = useT();
  const isAdmin = useIsAdmin();

  if (isAdmin === undefined) {
    return <NoticeCard title={t("common.loading")} body={t("admin.checkingAccess")} />;
  }
  if (!isAdmin) {
    return (
      <NoticeCard
        title={t("admin.adminsOnlyTitle")}
        body={t("admin.adminsOnlyBody")}
      />
    );
  }
  return <AdminDashboard />;
}

/**
 * /admin — admin-only panel.
 *
 * Gate is layered:
 *  1. <Unauthenticated> → prompt to sign in (no queries issued).
 *  2. <Authenticated>   → useIsAdmin decides: loading / not-admin notice / dashboard.
 *     Admin data queries (stats, listUsers) are only ever issued once isAdmin === true.
 *  3. Server-side, every admin query runs requireAdmin and throws for non-admins,
 *     so even a forged client cannot read admin data. This client gate is UX only.
 */
export default function AdminPage() {
  const { t } = useT();
  return (
    <div style={{ padding: "28px 20px 48px" }}>
      <Unauthenticated>
        <NoticeCard
          title={t("admin.signInRequiredTitle")}
          body={t("admin.signInRequiredBody")}
        />
      </Unauthenticated>
      <Authenticated>
        <AdminGate />
      </Authenticated>
    </div>
  );
}
