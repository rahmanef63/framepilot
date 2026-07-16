"use client";
// LanguageSwitcher — globe dropdown in the header. Lists every locale by its
// native name; picking one flips the whole app in place (I18nProvider persists
// it + sets <html lang/dir>). Closes on outside-click / Esc.
import React from "react";
import { Globe, Check } from "lucide-react";
import { useT, LOCALES, LOCALE_NAMES, type Locale } from "@/i18n";
import { useDismiss } from "@/components/shell/useDismiss";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  // Fixed-position the menu off the trigger's rect so it never gets clipped by a
  // container's overflow (header, or the editor tab bar). Right-anchored.
  const [pos, setPos] = React.useState<React.CSSProperties>({});
  const toggle = () => {
    const el = wrapRef.current;
    if (el && !open) {
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: Math.max(8, window.innerWidth - r.right) });
    }
    setOpen((v) => !v);
  };

  useDismiss(wrapRef, open, setOpen);

  const pick = (l: Locale) => {
    setLocale(l);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={toggle}
        title={t("lang.label")}
        aria-label={t("lang.label")}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 9px",
          cursor: "pointer",
          borderRadius: "var(--radius-md)",
          border: "var(--border-width) solid var(--border)",
          background: open ? "var(--muted)" : "transparent",
          color: "var(--foreground)",
          font: "600 12px var(--font-mono)",
          textTransform: "uppercase",
        }}
      >
        <Globe size={15} aria-hidden />
        {locale}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={t("lang.label")}
          style={{
            position: "fixed",
            ...pos,
            zIndex: 60,
            minWidth: 176,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: 6,
            background: "var(--card)",
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--elevation-overlay)",
          }}
        >
          {LOCALES.map((l) => {
            const on = l === locale;
            return (
              <button
                key={l}
                role="menuitemradio"
                aria-checked={on}
                aria-label={LOCALE_NAMES[l]}
                onClick={() => pick(l)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: "start",
                  border: 0,
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 9px",
                  cursor: "pointer",
                  background: on ? "var(--primary-soft)" : "transparent",
                  color: on ? "var(--primary)" : "var(--foreground)",
                  font: `${on ? 700 : 500} 12.5px var(--font-sans)`,
                }}
              >
                <span aria-hidden style={{ width: 22, font: "600 10px var(--font-mono)", opacity: 0.7, textTransform: "uppercase" }}>
                  {l}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>{LOCALE_NAMES[l]}</span>
                {on ? <Check size={14} aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
