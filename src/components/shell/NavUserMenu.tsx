"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { NavItem } from "@/components/ds/NavItem";
import { IconChip } from "@/components/ds/IconChip";
import { useDismiss } from "@/components/shell/useDismiss";
import { ThemeModeToggle } from "@/components/shell/ThemeModeToggle";
import { AccountModal } from "@/components/auth/AccountModal";
import { useIsAdmin } from "@/components/admin/useIsAdmin";
import { useT, LOCALES, LOCALE_NAMES } from "@/i18n";
import { Check, PanelLeft, Settings, BookOpen, Globe } from "lucide-react";

/**
 * NavUserMenu — collapses the whole sidebar footer (theme mode, Docs, Panduan,
 * Admin, account) into ONE dropdown so the primary nav + scene/frame manager
 * above keep their vertical room. Trigger reuses the ds NavItem (avatar); the
 * popover opens UPWARD (the footer sits at the sidebar bottom) and closes on
 * outside-click / Esc. Structure mirrors CreateMenu.
 */
export function NavUserMenu({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const isAdmin = useIsAdmin(); // undefined=loading, false/true resolved (UX gate only)
  const [open, setOpen] = React.useState(false);
  const [acct, setAcct] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState<React.CSSProperties>({});

  const toggle = () => {
    const el = wrapRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Anchor the popover ABOVE the trigger (footer is at the bottom of the rail).
      setPos(
        orientation === "horizontal"
          ? { left: r.left, width: r.width, bottom: vh - r.top + 6 }
          : { left: r.right + 8, width: 224, bottom: vh - r.bottom },
      );
    }
    setOpen((v) => !v);
  };

  useDismiss(wrapRef, open, setOpen);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const openAcct = () => {
    setOpen(false);
    setAcct(true);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", width: orientation === "horizontal" ? "100%" : undefined }}>
      <NavItem
        orientation={orientation}
        avatar
        icon={isAuthenticated ? <Check size={16} /> : "RF"}
        label={isAuthenticated ? t("shell.user.account") : t("shell.user.signIn")}
        active={open}
        chevron={orientation === "horizontal"}
        ariaHasPopup="menu"
        ariaExpanded={open}
        onClick={toggle}
        style={orientation === "horizontal" ? { width: "100%" } : undefined}
      />
      {open ? (
        <div
          role="menu"
          style={{
            position: "fixed",
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: 8,
            background: "var(--card)",
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--elevation-overlay)",
            ...pos,
          }}
        >
          <ThemeModeToggle />
          <LangRow />
          <Divider />
          <MenuLink icon={<PanelLeft size={16} />} label={t("shell.user.docs")} active={pathname.startsWith("/docs")} onClick={() => go("/docs")} />
          <MenuLink icon={<BookOpen size={16} aria-hidden />} label={t("header.crumb.guide")} active={pathname === "/panduan"} onClick={() => go("/panduan")} />
          {isAdmin ? <MenuLink icon={<Settings size={16} />} label={t("header.crumb.admin")} active={pathname === "/admin"} onClick={() => go("/admin")} /> : null}
          <Divider />
          <MenuLink
            icon={isAuthenticated ? <Check size={16} /> : "RF"}
            label={isAuthenticated ? t("shell.user.account") : t("shell.user.signIn")}
            active={isAuthenticated}
            onClick={openAcct}
          />
        </div>
      ) : null}
      <AccountModal open={acct} onClose={() => setAcct(false)} />
    </div>
  );
}

function Divider() {
  return <div style={{ height: "var(--border-width)", background: "var(--border)", margin: "2px 0" }} />;
}

// Language picker inside the user menu — the mobile-reachable switcher (the
// editor hides the header, so the header globe is desktop-only there). Compact
// row of locale-code chips, active one highlighted; flips the app in place.
function LangRow() {
  const { locale, setLocale, t } = useT();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "4px 2px 2px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          font: "700 9.5px var(--font-mono)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
          padding: "0 6px",
        }}
      >
        <Globe size={13} aria-hidden /> {t("lang.label")}
      </div>
      <div role="radiogroup" aria-label={t("lang.label")} style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: "0 4px" }}>
        {LOCALES.map((l) => {
          const on = l === locale;
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setLocale(l)}
              title={LOCALE_NAMES[l]}
              style={{
                flex: "1 1 0",
                minWidth: 38,
                padding: "6px 8px",
                cursor: "pointer",
                borderRadius: "var(--radius-sm)",
                border: "var(--border-width) solid " + (on ? "var(--primary)" : "var(--border)"),
                background: on ? "var(--primary-soft)" : "transparent",
                color: on ? "var(--primary)" : "var(--foreground)",
                font: `${on ? 700 : 600} 11px var(--font-mono)`,
                textTransform: "uppercase",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MenuLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      role="menuitem"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        border: 0,
        borderRadius: "var(--radius-sm)",
        padding: "8px 9px",
        cursor: "pointer",
        background: active ? "var(--primary-soft)" : hover ? "var(--muted)" : "transparent",
        color: active ? "var(--primary)" : "var(--foreground)",
      }}
    >
      <IconChip aria-hidden>{icon}</IconChip>
      <span style={{ font: "700 12.5px var(--font-sans)" }}>{label}</span>
    </button>
  );
}
