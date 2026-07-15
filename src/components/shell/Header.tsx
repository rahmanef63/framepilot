"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { useApp } from "@/state/AppState";
import { HeaderNav } from "@/components/shell/HeaderNav";
import { BrandMark } from "@/components/shell/BrandMark";
import { Menu, Plus, Braces } from "lucide-react";

const SCREEN_NAMES: Record<string, string> = {
  "/": "Studio 3D",
  "/library": "Pustaka",
  "/panduan": "Panduan · Guide",
  "/admin": "Admin",
};

/**
 * The single app header, shown on every (app)-shell route (including `/`, the
 * Studio home — the editor no longer draws its own top bar; it portals its
 * project CRUD into `#fp-header-actions` on the right).
 *
 * Three sections: LEFT = sidebar trigger + brand breadcrumb · CENTER = primary
 * nav (Buat / Studio 3D / Pustaka) · RIGHT = CRUD contextual to the active route.
 */
export function Header() {
  const app = useApp();
  const pathname = usePathname();
  const crumb = SCREEN_NAMES[pathname] || "Studio 3D · Prompt Kamera";
  const onData = pathname === "/library";
  const isStudio = pathname === "/";

  return (
    <header className="app-header">
      {/* LEFT — sidebar trigger + brand breadcrumb */}
      <div className="app-header-left">
        <button
          type="button"
          onClick={app.toggleSidebar}
          aria-label="Buka/tutup sidebar"
          aria-expanded={app.sidebarOpen}
          aria-controls="fp-sidebar"
          className="app-header-burger"
        >
          <span aria-hidden><Menu size={18} /></span>
        </button>
        <span className="app-header-brand" style={{ color: "var(--primary)" }} aria-hidden>
          <BrandMark size={22} />
        </span>
        <span className="app-header-brandword">Camera Angle Guide Pro</span>
        <span className="app-header-sep" aria-hidden>
          ›
        </span>
        <b className="app-header-crumb">{crumb}</b>
      </div>

      {/* CENTER — primary nav */}
      <div className="app-header-center">
        <HeaderNav />
      </div>

      {/* RIGHT — contextual CRUD. On `/` the editor portals its actions into the
          slot; other routes render their own. */}
      <div className="app-header-right">
        {/* display:contents so the portaled editor buttons lay out inline here */}
        <div id="fp-header-actions" style={{ display: "contents" }} />
        {onData ? (
          <>
            <span className="app-header-stats">{app.projStats}</span>
            <Button variant="outline" size="sm" icon={<Braces size={14} aria-hidden />} onClick={app.openSchema}>
              Skema
            </Button>
            <Button variant="outline" size="sm" onClick={app.exportProject}>
              Ekspor
            </Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => app.openImport("paste")}>
              Impor
            </Button>
          </>
        ) : isStudio ? null : (
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => app.openImport("paste")}>
            Impor
          </Button>
        )}
      </div>
    </header>
  );
}
