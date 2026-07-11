"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { NavItem } from "@/components/ds/NavItem";
import { ThemePresetSwitcher } from "@/components/shell/ThemePresetSwitcher";
import { ThemeModeToggle } from "@/components/shell/ThemeModeToggle";
import { AccountModal } from "@/components/auth/AccountModal";
import { useApp } from "@/state/AppState";

const F_LABELS: Record<string, string> = {
  all: "Semua",
  photo: "Foto",
  youtube: "YouTube",
  file: "File",
  paste: "Tempel",
};

interface MainNav {
  key: string;
  icon: string;
  label: string;
  href?: string;
  accent?: boolean;
  crown?: boolean;
  badge?: string;
  hasSub?: boolean;
  onClick?: () => void;
}

export function Sidebar() {
  const app = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const open = app.sidebarOpen;
  const [acctOpen, setAcctOpen] = React.useState(false);

  const orient: "horizontal" | "vertical" = open ? "horizontal" : "vertical";
  const itemAlign = open ? "stretch" : "center";

  const navMain: MainNav[] = [
    { key: "create", icon: "+", label: "Buat", accent: true, onClick: () => app.openImport("paste") },
    { key: "home", icon: "⌂", label: "Beranda", href: "/beranda" },
    { key: "projects", icon: "▤", label: "Proyek", href: "/proyek" },
    { key: "data", icon: "▧", label: "Data Prompt", crown: true, badge: "Baru", hasSub: true, href: "/" },
    { key: "editor", icon: "◈", label: "Studio 3D", href: "/editor" },
    { key: "templates", icon: "▦", label: "Template", href: "/template" },
    { key: "guide", icon: "?", label: "Panduan", href: "/panduan" },
  ];

  const isActive = (n: MainNav) => (n.href ? pathname === n.href : false);
  const onDataRoute = pathname === "/";

  const navSub = ["all", "photo", "youtube", "file", "paste"].map((k) => ({
    key: k,
    label: F_LABELS[k],
    count: app.counts[k] ?? 0,
    onClick: () => app.setSourceFilter(k),
    activeSub: app.sourceFilter === k,
  }));

  const notifItem = { key: "notif", icon: "◎", label: "Notifikasi", avatar: false, onClick: () => app.showToast("Notifikasi · sample") };
  const acctProps = { orientation: orient, avatar: true, onClick: () => setAcctOpen(true), style: orient === "horizontal" ? { width: "100%" } : undefined } as const;

  return (
    <aside
      style={{
        width: open ? "246px" : "72px",
        flex: "none",
        display: "flex",
        flexDirection: "column",
        padding: "14px 10px",
        borderRight: "var(--border-width) solid var(--border)",
        background: "var(--card)",
        overflow: "hidden",
        transition: "width var(--motion) var(--ease)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "2px 4px 12px",
          justifyContent: open ? "flex-start" : "center",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            flex: "none",
            borderRadius: "var(--radius-md)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            display: "grid",
            placeItems: "center",
            font: "700 16px var(--font-mono)",
          }}
        >
          ◉
        </div>
        {open ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "800 14px var(--font-sans)", color: "var(--foreground)", lineHeight: 1.05 }}>
              Camera Angle
            </div>
            <div style={{ font: "500 11px var(--font-mono)", color: "var(--muted-foreground)" }}>Guide Pro</div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          alignItems: itemAlign,
        }}
      >
        {navMain.map((m) => {
          const active = isActive(m);
          const showSub = open && m.hasSub && onDataRoute;
          return (
            <React.Fragment key={m.key}>
              <NavItem
                orientation={orient}
                icon={m.icon}
                label={m.label}
                active={active}
                accent={m.accent}
                crown={m.crown}
                badge={open ? m.badge : undefined}
                chevron={open ? !!m.hasSub : false}
                onClick={() => (m.onClick ? m.onClick() : m.href && router.push(m.href))}
                style={orient === "horizontal" ? { width: "100%" } : undefined}
              />
              {showSub ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    margin: "2px 0 8px 19px",
                    paddingLeft: "12px",
                    borderLeft: "var(--border-width) solid var(--border)",
                  }}
                >
                  {navSub.map((s) => (
                    <button
                      key={s.key}
                      onClick={s.onClick}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        textAlign: "left",
                        border: 0,
                        borderRadius: "var(--radius-sm)",
                        padding: "6px 9px",
                        cursor: "pointer",
                        background: s.activeSub ? "var(--primary-soft)" : "transparent",
                        color: s.activeSub ? "var(--primary)" : "var(--foreground)",
                        font: `${s.activeSub ? 600 : 400} 12px var(--font-sans)`,
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {s.label}
                      </span>
                      <span style={{ font: "600 10px var(--font-mono)", opacity: 0.7 }}>{s.count}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          paddingTop: "8px",
          borderTop: "var(--border-width) solid var(--border)",
          alignItems: itemAlign,
        }}
      >
        <ThemeModeToggle orientation={orient} />
        <ThemePresetSwitcher orientation={orient} />
        <NavItem
          orientation={orient}
          icon={notifItem.icon}
          label={notifItem.label}
          avatar={notifItem.avatar}
          onClick={notifItem.onClick}
          style={orient === "horizontal" ? { width: "100%" } : undefined}
        />
        <AuthLoading>
          <NavItem {...acctProps} icon="RF" label="Akun" />
        </AuthLoading>
        <Unauthenticated>
          <NavItem {...acctProps} icon="RF" label="Masuk" />
        </Unauthenticated>
        <Authenticated>
          <NavItem {...acctProps} icon="✓" label="Akun" active />
        </Authenticated>
      </div>

      <AccountModal open={acctOpen} onClose={() => setAcctOpen(false)} />
    </aside>
  );
}
