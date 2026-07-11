import React, { CSSProperties, ReactNode } from "react";

/**
 * Badge — the small mono status label.
 * Tones: default (neutral), new (accent), highlight (annotation), outline.
 * Ported from ds-a components/feedback/Badge.jsx.
 */
export type BadgeTone = "default" | "new" | "highlight" | "outline";

export function Badge({
  tone = "default",
  icon = null,
  children,
  style = {},
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const tones: Record<BadgeTone, CSSProperties> = {
    default: {
      background: "var(--muted)",
      color: "var(--muted-foreground)",
      border: "1px solid var(--border)",
    },
    new: {
      background: "var(--primary)",
      color: "var(--primary-foreground)",
      border: 0,
    },
    highlight: {
      background: "var(--highlight)",
      color: "var(--foreground)",
      border: "1px solid var(--foreground)",
    },
    outline: {
      background: "transparent",
      color: "var(--muted-foreground)",
      border: "1px solid var(--border)",
    },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        font: "700 10px var(--font-mono)",
        borderRadius: "var(--radius-sm)",
        padding: "2px 6px",
        whiteSpace: "nowrap",
        ...tones[tone],
        ...style,
      }}
    >
      {icon ? <span>{icon}</span> : null}
      {children}
    </span>
  );
}
