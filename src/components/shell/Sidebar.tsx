"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { NavItem } from "@/components/ds/NavItem";
import { CreateMenu } from "@/components/shell/CreateMenu";
import { ThemeModeToggle } from "@/components/shell/ThemeModeToggle";
import { AccountModal } from "@/components/auth/AccountModal";
import { useIsAdmin } from "@/components/admin/useIsAdmin";
import { useApp } from "@/state/AppState";

interface MainNav {
  key: string;
  icon: string;
  label: string;
  href?: string;
  accent?: boolean;
  crown?: boolean;
  badge?: string;
  onClick?: () => void;
}

export function Sidebar() {
  const app = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = useIsAdmin(); // undefined=loading, false=not admin, true=admin (UX gate only)
  const open = app.sidebarOpen;
  const [acctOpen, setAcctOpen] = React.useState(false);

  const orient: "horizontal" | "vertical" = open ? "horizontal" : "vertical";
  const itemAlign = open ? "stretch" : "center";

  // The two REAL tools. Studio 3D is the app home (it produces the Prompt
  // Kamera — the hero output), so it leads with the crown; Pustaka is the one
  // merged project list (localStorage + Convex, SSOT) that feeds it.
  const navCore: MainNav[] = [
    { key: "editor", icon: "◈", label: "Studio 3D", crown: true, badge: "Prompt Kamera", href: "/editor" },
    { key: "library", icon: "▧", label: "Pustaka", href: "/library" },
  ];

  const isActive = (n: MainNav) => (n.href ? pathname === n.href : false);

  const renderNav = (m: MainNav) => (
    <NavItem
      orientation={orient}
      icon={m.icon}
      label={m.label}
      active={isActive(m)}
      accent={m.accent}
      crown={m.crown}
      badge={open ? m.badge : undefined}
      onClick={() => (m.onClick ? m.onClick() : m.href && router.push(m.href))}
      style={orient === "horizontal" ? { width: "100%" } : undefined}
    />
  );

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
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
          title="Beranda"
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
            textDecoration: "none",
          }}
        >
          ◉
        </a>
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
        <CreateMenu
          orientation={orient}
          onNew3D={() => router.push("/editor")}
          onFromImage={() => app.openImport("photo")}
          onFromTemplate={() => router.push("/template")}
        />

        {open ? <SectionLabel>Alat</SectionLabel> : <SectionDivider />}
        {navCore.map((m) => (
          <React.Fragment key={m.key}>{renderNav(m)}</React.Fragment>
        ))}
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
        <NavItem
          orientation={orient}
          icon="?"
          label="Panduan"
          active={pathname === "/panduan"}
          onClick={() => router.push("/panduan")}
          style={orient === "horizontal" ? { width: "100%" } : undefined}
        />
        {isAdmin ? (
          <NavItem
            orientation={orient}
            icon="⚙"
            label="Admin"
            active={pathname === "/admin"}
            onClick={() => router.push("/admin")}
            style={orient === "horizontal" ? { width: "100%" } : undefined}
          />
        ) : null}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: "700 9.5px var(--font-mono)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--muted-foreground)",
        padding: "12px 10px 4px",
      }}
    >
      {children}
    </div>
  );
}

function SectionDivider() {
  return (
    <div
      style={{
        width: "28px",
        height: "var(--border-width)",
        background: "var(--border)",
        margin: "10px 0 6px",
      }}
    />
  );
}
