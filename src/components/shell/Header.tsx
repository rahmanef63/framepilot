"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/state/AppState";
import { HeaderNav } from "@/components/shell/HeaderNav";
import { BrandMark } from "@/components/shell/BrandMark";
import { LanguageSwitcher } from "@/components/shell/LanguageSwitcher";
import { useT } from "@/i18n";
import { Menu } from "lucide-react";

const CRUMB_KEYS: Record<string, string> = {
  "/": "header.crumb.studio",
  "/library": "header.crumb.library",
  "/panduan": "header.crumb.guide",
  "/admin": "header.crumb.admin",
};

/**
 * The single app header, shown on every (app)-shell route (including `/`, the
 * Studio home — the editor no longer draws its own top bar; it portals its
 * project CRUD into `#fp-header-actions` on the right).
 *
 * Three sections: LEFT = sidebar trigger + brand breadcrumb · CENTER = primary
 * nav (Buat / Studio 3D / Pustaka) · RIGHT = GLOBAL controls only (language + the
 * editor's portaled project CRUD). Per-screen feature actions (Schema/Export/
 * Import, view switcher, …) live in each screen's own feature header — not here —
 * so this app bar stays uncramped on mobile and reads as distinct global chrome.
 */
export function Header() {
  const app = useApp();
  const { t } = useT();
  const pathname = usePathname();
  const crumb = CRUMB_KEYS[pathname] ? t(CRUMB_KEYS[pathname]) : t("header.crumb.fallback");

  return (
    <header className="app-header">
      {/* LEFT — sidebar trigger + brand breadcrumb */}
      <div className="app-header-left">
        <button
          type="button"
          onClick={app.toggleSidebar}
          aria-label={t("header.toggleSidebar")}
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

      {/* RIGHT — GLOBAL controls only: the editor portals its project CRUD into the
          slot (desktop); the language switcher is always here. Feature actions live
          in each screen's feature header. */}
      <div className="app-header-right">
        {/* display:contents so the portaled editor buttons lay out inline here */}
        <div id="fp-header-actions" style={{ display: "contents" }} />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
