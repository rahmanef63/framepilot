"use client";
import React, { useEffect, useState } from "react";
import { applyMode, bootMode, getMode, setMode, type Mode } from "@/lib/theme/theme-mode";

/**
 * ThemeModeToggle — 3-way segmented Light / Dark / System control.
 * Orthogonal to ThemePresetSwitcher: this toggles `data-theme` (which block
 * wins), the preset switcher injects the palette (what the block contains).
 * Built on app tokens only (no ds import needed — pure token styling).
 * Boots the saved mode once on mount.
 */
const OPTS: { mode: Mode; icon: string; label: string; title: string }[] = [
  { mode: "light", icon: "☀", label: "Terang", title: "Mode terang" },
  { mode: "dark", icon: "☾", label: "Gelap", title: "Mode gelap" },
  { mode: "system", icon: "⌂", label: "Sistem", title: "Ikut sistem" },
];

export function ThemeModeToggle({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) {
  const [mode, setModeState] = useState<Mode>("system");
  const compact = orientation === "vertical";

  useEffect(() => {
    bootMode();
    setModeState(getMode());
  }, []);

  const select = (m: Mode) => {
    setMode(m);
    applyMode(m);
    setModeState(m);
  };

  return (
    <div
      role="group"
      aria-label="Mode tema"
      style={{
        display: "flex",
        width: "100%",
        gap: "2px",
        padding: "2px",
        borderRadius: "var(--radius-pill)",
        background: "var(--muted)",
        border: "var(--border-width) solid var(--border)",
      }}
    >
      {OPTS.map((o) => {
        const active = mode === o.mode;
        return (
          <button
            key={o.mode}
            type="button"
            title={o.title}
            aria-pressed={active}
            onClick={() => select(o.mode)}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              minWidth: 0,
              padding: compact ? "6px 0" : "6px 8px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              cursor: "pointer",
              background: active ? "var(--card)" : "transparent",
              color: active ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: active ? "var(--shadow-sm)" : "none",
              font: "700 12px var(--font-sans)",
              lineHeight: 1,
              transition: "background var(--motion) var(--ease), color var(--motion) var(--ease)",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95em" }}>{o.icon}</span>
            {compact ? null : o.label}
          </button>
        );
      })}
    </div>
  );
}
