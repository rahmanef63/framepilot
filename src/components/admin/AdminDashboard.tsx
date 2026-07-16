"use client";

import React, { CSSProperties } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ds/Badge";
import { useT } from "@/i18n";

/** Coarse "n units ago" from a ms timestamp. Admin-internal, English only. */
function relTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/**
 * A compact "label + count" breakdown table with an inline proportion bar
 * (background width %). No chart library. Admin-internal, English labels.
 */
function BreakdownTable({
  heading,
  keyCol,
  rows,
}: {
  heading: string;
  keyCol: string;
  rows: { key: string; count: number }[] | undefined;
}) {
  const max = rows && rows.length > 0 ? Math.max(...rows.map((r) => r.count)) : 0;
  return (
    <section
      style={{
        flex: "1 1 260px",
        minWidth: 0,
        borderRadius: "var(--radius-lg)",
        border: "var(--border-width) solid var(--border)",
        background: "var(--card)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 14px", borderBottom: "var(--border-width) solid var(--border)" }}>
        <h3 style={{ margin: 0, font: "700 13px var(--font-sans)", color: "var(--foreground)" }}>{heading}</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headBase}>{keyCol}</th>
              <th style={{ ...headBase, textAlign: "right" }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {rows === undefined ? (
              <tr>
                <td colSpan={2} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                  No data
                </td>
              </tr>
            ) : (
              rows.map((r, i) => {
                const last = i === rows.length - 1;
                const bb = last ? 0 : "var(--border-width) solid var(--border)";
                const pct = max > 0 ? Math.round((r.count / max) * 100) : 0;
                return (
                  <tr key={r.key + i}>
                    <td
                      style={{
                        ...cellBase,
                        borderBottom: bb,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        background: `linear-gradient(to right, color-mix(in srgb, var(--primary) 14%, transparent) ${pct}%, transparent ${pct}%)`,
                      }}
                    >
                      {r.key || "—"}
                    </td>
                    <td style={{ ...cellBase, borderBottom: bb, textAlign: "right", font: "600 12px var(--font-mono)" }}>
                      {r.count.toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** dd MMM yyyy in Bahasa Indonesia, from a ms timestamp. */
function formatTanggal(ms: number): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(ms));
  } catch {
    return "—";
  }
}

/** One headline metric card. */
function StatTile({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div
      style={{
        flex: "1 1 180px",
        minWidth: 0,
        padding: "18px 20px",
        borderRadius: "var(--radius-lg)",
        border: "var(--border-width) solid var(--border)",
        background: "var(--card)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div style={{ font: "700 10px var(--font-mono)", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ marginTop: "8px", font: "800 30px var(--font-sans)", color: "var(--foreground)", lineHeight: 1.05 }}>
        {value === undefined ? "…" : value.toLocaleString("id-ID")}
      </div>
    </div>
  );
}

const cellBase: CSSProperties = {
  padding: "11px 14px",
  font: "500 13px var(--font-sans)",
  color: "var(--foreground)",
  textAlign: "left",
  verticalAlign: "middle",
  borderBottom: "var(--border-width) solid var(--border)",
  whiteSpace: "nowrap",
};

const headBase: CSSProperties = {
  padding: "10px 14px",
  font: "700 10px var(--font-mono)",
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "left",
  borderBottom: "var(--border-width) solid var(--border)",
  whiteSpace: "nowrap",
};

/**
 * AdminDashboard — admin-only overview.
 * Renders stat tiles (users / projects) + a user roster table.
 * Only mounted once `useIsAdmin` is true, so these admin-only queries are
 * never even issued for a non-admin. The server also enforces via requireAdmin.
 */
export function AdminDashboard() {
  const { t } = useT();
  const stats = useQuery(api.admin.stats);
  const users = useQuery(api.admin.listUsers);

  // Computed ONCE so the query args stay referentially stable across renders
  // (inlining Date.now() into the useQuery args would refetch every render).
  const sinceTs = React.useMemo(() => Date.now() - 14 * 24 * 60 * 60 * 1000, []);
  const analytics = useQuery(api.analytics.summary, { sinceTs });
  const errors = useQuery(api.analytics.recentErrors, { limit: 30 });

  return (
    <div style={{ width: "100%", maxWidth: "960px", margin: "0 auto" }}>
      <header style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, font: "800 22px var(--font-sans)", color: "var(--foreground)" }}>
          {t("admin.panelTitle")}
        </h1>
        <p style={{ marginTop: "6px", font: "400 13px var(--font-sans)", color: "var(--muted-foreground)" }}>
          {t("admin.panelSubtitle")}
        </p>
      </header>

      {/* Stat tiles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "26px" }}>
        <StatTile label={t("admin.totalUsers")} value={stats?.userCount} />
        <StatTile label={t("admin.totalProjects")} value={stats?.projectCount} />
      </div>

      {/* User table */}
      <section
        style={{
          borderRadius: "var(--radius-lg)",
          border: "var(--border-width) solid var(--border)",
          background: "var(--card)",
          boxShadow: "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 16px", borderBottom: "var(--border-width) solid var(--border)" }}>
          <h2 style={{ margin: 0, font: "700 14px var(--font-sans)", color: "var(--foreground)" }}>
            {t("admin.usersHeading")}
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
            <thead>
              <tr>
                <th style={headBase}>{t("admin.colEmail")}</th>
                <th style={headBase}>{t("admin.colName")}</th>
                <th style={{ ...headBase, textAlign: "right" }}>{t("admin.colProjects")}</th>
                <th style={{ ...headBase, textAlign: "right" }}>{t("admin.colJoined")}</th>
              </tr>
            </thead>
            <tbody>
              {users === undefined ? (
                <tr>
                  <td colSpan={4} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                    {t("common.loading")}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                    {t("admin.noUsers")}
                  </td>
                </tr>
              ) : (
                users.map((u, i) => {
                  const last = i === users.length - 1;
                  const bb = last ? 0 : "var(--border-width) solid var(--border)";
                  return (
                    <tr key={u._id}>
                      <td style={{ ...cellBase, borderBottom: bb, whiteSpace: "normal", wordBreak: "break-all" }}>
                        {u.email ?? "—"}
                      </td>
                      <td style={{ ...cellBase, borderBottom: bb, color: u.name ? "var(--foreground)" : "var(--muted-foreground)" }}>
                        {u.name ?? "—"}
                      </td>
                      <td style={{ ...cellBase, borderBottom: bb, textAlign: "right" }}>
                        <Badge tone={u.projectCount > 0 ? "new" : "default"}>{u.projectCount}</Badge>
                      </td>
                      <td style={{ ...cellBase, borderBottom: bb, textAlign: "right", color: "var(--muted-foreground)", font: "500 12px var(--font-mono)" }}>
                        {formatTanggal(u.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Analytics (last 14 days) ─────────────────────────────────────── */}
      <header style={{ margin: "34px 0 16px" }}>
        <h2 style={{ margin: 0, font: "800 18px var(--font-sans)", color: "var(--foreground)" }}>
          Analytics (last 14 days)
        </h2>
        <p style={{ marginTop: "5px", font: "400 12px var(--font-sans)", color: "var(--muted-foreground)" }}>
          First-party, anonymous pageview telemetry — no PII.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
        <StatTile label="Pageviews" value={analytics?.total} />
        <StatTile label="Unique sessions" value={analytics?.uniqueSessions} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
        <BreakdownTable
          heading="By locale"
          keyCol="Locale"
          rows={analytics?.byLocale.map((r) => ({ key: r.locale, count: r.count }))}
        />
        <BreakdownTable
          heading="By device"
          keyCol="Device"
          rows={analytics?.byDevice.map((r) => ({ key: r.device, count: r.count }))}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
        <BreakdownTable
          heading="Top paths"
          keyCol="Path"
          rows={analytics?.topPaths.map((r) => ({ key: r.path, count: r.count }))}
        />
        <BreakdownTable
          heading="By day"
          keyCol="Day"
          rows={analytics?.byDay.map((r) => ({ key: r.day, count: r.count }))}
        />
      </div>

      {/* Recent client errors */}
      <section
        style={{
          borderRadius: "var(--radius-lg)",
          border: "var(--border-width) solid var(--border)",
          background: "var(--card)",
          boxShadow: "var(--shadow-xs)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 16px", borderBottom: "var(--border-width) solid var(--border)" }}>
          <h3 style={{ margin: 0, font: "700 14px var(--font-sans)", color: "var(--foreground)" }}>
            Recent client errors
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
            <thead>
              <tr>
                <th style={headBase}>Message</th>
                <th style={headBase}>Path</th>
                <th style={{ ...headBase, textAlign: "right" }}>When</th>
              </tr>
            </thead>
            <tbody>
              {errors === undefined ? (
                <tr>
                  <td colSpan={3} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                    Loading…
                  </td>
                </tr>
              ) : errors.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                    No client errors 🎉
                  </td>
                </tr>
              ) : (
                errors.map((e, i) => {
                  const last = i === errors.length - 1;
                  const bb = last ? 0 : "var(--border-width) solid var(--border)";
                  return (
                    <tr key={e._id}>
                      <td style={{ ...cellBase, borderBottom: bb, whiteSpace: "normal", wordBreak: "break-word", color: "var(--destructive, var(--foreground))" }}>
                        {e.message}
                      </td>
                      <td style={{ ...cellBase, borderBottom: bb, whiteSpace: "normal", wordBreak: "break-all", color: "var(--muted-foreground)", font: "500 12px var(--font-mono)" }}>
                        {e.path}
                      </td>
                      <td style={{ ...cellBase, borderBottom: bb, textAlign: "right", color: "var(--muted-foreground)", font: "500 12px var(--font-mono)" }}>
                        {relTime(e.ts)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
