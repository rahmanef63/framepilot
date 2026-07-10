import React, { CSSProperties } from "react";

/**
 * Tabs — a horizontal segmented nav with an underline active marker.
 * Ported from ds-a components/navigation/Tabs.jsx.
 */
export function Tabs({
  tabs = [],
  value,
  onChange,
  style = {},
}: {
  tabs?: { key: string; label: string }[];
  value?: string;
  onChange?: (key: string) => void;
  style?: CSSProperties;
}) {
  const active = value ?? (tabs[0] && tabs[0].key);
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        borderBottom: "var(--border-width) solid var(--border)",
        ...style,
      }}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange && onChange(t.key)}
            style={{
              background: "none",
              border: 0,
              borderBottom: `2px solid ${on ? "var(--primary)" : "transparent"}`,
              padding: "9px 12px",
              cursor: "pointer",
              font: `${on ? 700 : 400} 13px var(--font-sans)`,
              color: on ? "var(--primary)" : "var(--muted-foreground)",
              marginBottom: "calc(-1 * var(--border-width))",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
