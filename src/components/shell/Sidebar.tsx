"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavUserMenu } from "@/components/shell/NavUserMenu";
import { BrandMark } from "@/components/shell/BrandMark";
import { NavItem } from "@/components/ds/NavItem";
import { useApp } from "@/state/AppState";
import { Camera, Library, LayoutTemplate } from "lucide-react";

/**
 * The left rail — now dedicated to the scene/frame manager. Three sections:
 * HEADER (brand logo) · MAIN (the scene/frame manager, portaled into
 * #fp-studio-slot on Studio) · FOOTER (the NavUserMenu dropdown). Primary
 * navigation (Buat / Studio 3D / Pustaka) moved to the header center.
 */
export function Sidebar() {
  const app = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const open = app.sidebarOpen;
  const orient: "horizontal" | "vertical" = open ? "horizontal" : "vertical";
  const itemAlign = open ? "stretch" : "center";
  const isStudio = pathname === "/";

  // Mobile only: close the ☰ drawer on navigation so a tapped destination isn't
  // left covered by the fixed drawer + scrim. Gated to ≤820 (the drawer breakpoint)
  // so the in-flow desktop rail is never collapsed by a route change.
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 820px)").matches && app.sidebarOpen) {
      app.toggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <aside
        id="fp-sidebar"
        aria-label="Studio"
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
        {/* HEADER — brand logo (mark repaints with the theme via currentColor) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "2px 4px 12px",
            justifyContent: open ? "flex-start" : "center",
            flex: "none",
          }}
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
            title="Beranda · Studio 3D"
            style={{
              width: "38px",
              height: "38px",
              flex: "none",
              borderRadius: "var(--radius-md)",
              background: "var(--primary-soft)",
              color: "var(--primary)",
              display: "grid",
              placeItems: "center",
              textDecoration: "none",
            }}
          >
            <BrandMark size={24} />
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

        {/* Mobile drawer nav (≤820, Studio only) — the header-center nav is hidden on
            the mobile editor, so the primary destinations live here in the ☰ drawer.
            display:none on desktop (there the header owns the nav). */}
        {isStudio ? (
          <nav className="fp-drawer-nav" aria-label="Navigasi utama">
            {/* only rendered on Studio (isStudio), so Studio 3D is the active one */}
            <NavItem orientation="horizontal" icon={<Camera size={16} />} label="Studio 3D" active onClick={() => router.push("/")} />
            <NavItem orientation="horizontal" icon={<Library size={16} />} label="Pustaka" onClick={() => router.push("/library")} />
            <NavItem orientation="horizontal" icon={<LayoutTemplate size={16} />} label="Template" onClick={() => router.push("/template")} />
          </nav>
        ) : null}

        {/* Mobile editor: the app header (and its ⋯ menu) is hidden, so the project
            actions portal here (EditorHeaderActions → #fp-drawer-actions). Hidden on
            desktop via CSS (there the ⋯ header menu owns them). */}
        {isStudio ? (
          <div className="fp-drawer-actions-wrap">
            <div className="fp-drawer-heading">Aksi proyek</div>
            <div id="fp-drawer-actions" />
          </div>
        ) : null}

        {/* MAIN — the scene & frame manager (portaled into #fp-studio-slot on Studio).
            The divider + spacing only read when the rail is expanded (the collapsed
            72px rail has no MAIN content, so a lone border would just be a stray line). */}
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            marginTop: open ? "4px" : 0,
            paddingTop: open ? "8px" : 0,
            borderTop: open ? "var(--border-width) solid var(--border)" : "none",
          }}
        >
          {open && isStudio ? (
            <div
              className="fp-scene-heading"
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
          ) : null}
          {/* #fp-studio-slot MUST stay mounted (display toggle, not conditional
              render) — OutlineSidebar resolves the portal target once on mount, so
              removing it from the DOM would break the manager when the mobile
              drawer opens after mount. */}
          <div
            id="fp-studio-slot"
            data-tour="shots"
            style={{
              display: open && isStudio ? "flex" : "none",
              flex: "1 1 auto",
              minHeight: 0,
              flexDirection: "column",
            }}
          />
          {open && !isStudio ? (
            <p style={{ font: "400 12px var(--font-sans)", color: "var(--muted-foreground)", lineHeight: 1.5, padding: "4px 6px" }}>
              Buka{" "}
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/");
                }}
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Studio 3D
              </a>{" "}
              untuk menyusun scene &amp; frame.
            </p>
          ) : null}
        </div>

        {/* FOOTER — user dropdown (theme + Docs + Panduan + Admin + account) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "8px",
            borderTop: "var(--border-width) solid var(--border)",
            alignItems: itemAlign,
            flex: "none",
          }}
        >
          <NavUserMenu orientation={orient} />
        </div>
      </aside>
      {/* Mobile drawer scrim — sibling of .fp-sidebar so `.fp-sidebar.open ~ .fp-scrim`
          lights it up; tap to close. Inert (display:none) on desktop. */}
      <div className="fp-scrim" onClick={app.toggleSidebar} aria-hidden />
    </>
  );
}
