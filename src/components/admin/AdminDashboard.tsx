"use client";

import React, { CSSProperties } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ds/Badge";

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
  const stats = useQuery(api.admin.stats);
  const users = useQuery(api.admin.listUsers);

  return (
    <div style={{ width: "100%", maxWidth: "960px", margin: "0 auto" }}>
      <header style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, font: "800 22px var(--font-sans)", color: "var(--foreground)" }}>
          Panel Admin
        </h1>
        <p style={{ marginTop: "6px", font: "400 13px var(--font-sans)", color: "var(--muted-foreground)" }}>
          Ringkasan pengguna dan proyek FramePilot. · Overview of users and projects.
        </p>
      </header>

      {/* Stat tiles */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginBottom: "26px" }}>
        <StatTile label="Total Pengguna" value={stats?.userCount} />
        <StatTile label="Total Proyek" value={stats?.projectCount} />
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
            Pengguna
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
            <thead>
              <tr>
                <th style={headBase}>Email</th>
                <th style={headBase}>Nama</th>
                <th style={{ ...headBase, textAlign: "right" }}>Proyek</th>
                <th style={{ ...headBase, textAlign: "right" }}>Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {users === undefined ? (
                <tr>
                  <td colSpan={4} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                    Memuat…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...cellBase, color: "var(--muted-foreground)", textAlign: "center", borderBottom: 0 }}>
                    Belum ada pengguna.
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
    </div>
  );
}
