"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "@/components/ds/NavItem";
import { CreateMenu } from "@/components/shell/CreateMenu";
import { NavUserMenu } from "@/components/shell/NavUserMenu";
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
  const open = app.sidebarOpen;

  const orient: "horizontal" | "vertical" = open ? "horizontal" : "vertical";
  const itemAlign = open ? "stretch" : "center";
  // Studio is the app home (`/`). On Studio the scene+frame manager portals into
  // the slot below the nav (see #fp-studio-slot), so the nav yields its flex-grow
  // to the manager and the manager gets its own scroll area between two dividers.
  const isStudio = pathname === "/";

  // The two REAL tools. Studio 3D is the app home (it produces the Prompt
  // Kamera — the hero output), so it leads with the crown; Pustaka is the one
  // merged project list (localStorage + Convex, SSOT) that feeds it.
  const navCore: MainNav[] = [
    { key: "editor", icon: "◈", label: "Studio 3D", crown: true, badge: "Prompt Kamera", href: "/" },
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

  return (
    <>
    <aside
      className={"fp-sidebar" + (open ? " open" : "")}
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
          // On Studio the manager slot below takes the flex space; elsewhere the
          // nav grows to push the footer down.
          flex: isStudio ? "0 1 auto" : 1,
          alignItems: itemAlign,
        }}
      >
        <CreateMenu
          orientation={orient}
          onNew3D={() => router.push("/")}
          onFromImage={() => app.openImport("photo")}
          onFromTemplate={() => router.push("/template")}
        />

        {open ? <SectionLabel>Alat</SectionLabel> : <SectionDivider />}
        {navCore.map((m) => (
          <React.Fragment key={m.key}>{renderNav(m)}</React.Fragment>
        ))}
      </div>

      {/* Scene & Frame manager slot — the editor portals its OutlineSidebar here
          on Studio (own scroll, divider top + bottom via the footer's border). */}
      <div
        className="fp-sidebar-studio"
        data-tour="shots"
        style={{
          display: isStudio && open ? "flex" : "none",
          flexDirection: "column",
          flex: "1 1 auto",
          minHeight: 0,
          marginTop: "8px",
          paddingTop: "8px",
          borderTop: "var(--border-width) solid var(--border)",
        }}
      >
        <div
          style={{
            font: "700 9.5px var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
            padding: "0 6px 6px",
            flex: "none",
          }}
        >
          Scene &amp; Frame
        </div>
        <div id="fp-studio-slot" style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" }} />
      </div>

      {/* Footer collapsed to ONE user dropdown (theme + Docs + Panduan + Admin +
          account) so the nav + scene/frame manager above keep their room. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          paddingTop: "8px",
          borderTop: "var(--border-width) solid var(--border)",
          alignItems: itemAlign,
        }}
      >
        <NavUserMenu orientation={orient} />
      </div>
    </aside>
    {/* Mobile drawer scrim — sibling of .fp-sidebar so `.fp-sidebar.open ~
        .fp-scrim` can light it up; tap to close. Inert (display:none) on desktop. */}
    <div className="fp-scrim" onClick={app.toggleSidebar} aria-hidden />
    </>
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
