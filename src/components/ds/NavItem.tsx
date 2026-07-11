"use client";
import React, { CSSProperties, ReactNode, useState } from "react";

/**
 * NavItem — a single navigation entry. `horizontal` is a sidebar/menu row
 * (icon + label inline, optional trailing badge/chevron); `vertical` is a
 * rail tile (icon box + label beneath).
 * Ported from ds-a components/navigation/NavItem.jsx.
 */
export function NavItem({
  icon = "◦",
  label,
  active = false,
  badge = null,
  chevron = false,
  crown = false,
  accent = false,
  avatar = false,
  orientation = "vertical",
  onClick,
  style = {},
}: {
  icon?: ReactNode;
  label?: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  chevron?: boolean;
  crown?: boolean;
  accent?: boolean;
  avatar?: boolean;
  orientation?: "vertical" | "horizontal";
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  const bg = active ? "var(--primary-soft)" : hover ? "var(--muted)" : "transparent";

  if (orientation === "horizontal") {
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width: "100%",
          textAlign: "left",
          border: 0,
          borderRadius: "var(--radius-md)",
          padding: "9px 10px",
          cursor: "pointer",
          font: `${active ? 700 : 400} 13px var(--font-sans)`,
          background: bg,
          color: active ? "var(--primary)" : "var(--foreground)",
          ...style,
        }}
      >
        <span
          style={{
            width: "24px",
            height: "24px",
            flex: "none",
            borderRadius: "7px",
            border: "var(--border-width) solid var(--border)",
            display: "grid",
            placeItems: "center",
            font: "600 10px var(--font-mono)",
            color: "var(--subtle-foreground)",
          }}
        >
          {icon}
        </span>
        {label}
        {badge ? (
          <span
            style={{
              font: "700 8px var(--font-mono)",
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: "var(--radius-sm)",
              padding: "1px 5px",
              marginLeft: "auto",
            }}
          >
            {badge}
          </span>
        ) : null}
        {chevron ? (
          <span
            style={{
              marginLeft: badge ? "6px" : "auto",
              fontFamily: "var(--font-mono)",
              color: "var(--subtle-foreground)",
            }}
          >
            {"›"}
          </span>
        ) : null}
      </button>
    );
  }

  const slot: CSSProperties = avatar
    ? {
        width: "40px",
        height: "40px",
        borderRadius: "var(--radius-pill)",
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        border: active ? "2px solid var(--primary)" : 0,
      }
    : {
        width: "42px",
        height: "42px",
        borderRadius: "var(--radius-md)",
        border: accent ? 0 : `var(--border-width) solid ${active ? "var(--primary)" : "var(--border)"}`,
        background: accent ? "var(--primary)" : "var(--card)",
        color: accent
          ? "var(--primary-foreground)"
          : active
          ? "var(--primary)"
          : "var(--muted-foreground)",
      };

  return (
    <button
      onClick={onClick}
      title={typeof label === "string" ? label : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        width: "64px",
        padding: "7px 2px",
        border: 0,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        background: bg,
        color: active ? "var(--primary)" : "var(--muted-foreground)",
        position: "relative",
        ...style,
      }}
    >
      <span
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          font: "700 13px var(--font-mono)",
          ...slot,
        }}
      >
        {icon}
        {crown ? (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-6px",
              font: "700 8px var(--font-mono)",
              background: "var(--highlight)",
              color: "var(--foreground)",
              border: "1px solid var(--foreground)",
              borderRadius: "var(--radius-sm)",
              padding: "0 3px",
            }}
          >
            {"★"}
          </span>
        ) : null}
      </span>
      <span style={{ font: "400 9.5px/1.1 var(--font-sans)", textAlign: "center", color: "inherit" }}>
        {label}
      </span>
    </button>
  );
}
