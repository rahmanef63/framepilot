"use client";
import React, { CSSProperties, ReactNode, useEffect, useState } from "react";

/** Backdrop — the scrim behind modals. Ported from ds-a. */
export function Backdrop({
  onClick,
  dark = true,
  style = {},
}: {
  onClick?: () => void;
  dark?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed",
        inset: 0,
        background: dark ? "var(--overlay)" : "transparent",
        animation: "ds-fade var(--motion) var(--ease)",
        ...style,
      }}
    />
  );
}

/** CloseButton — the ✕ icon button on overlays. Ported from ds-a. */
export function CloseButton({
  onClick,
  title = "Tutup",
  variant = "default",
  style = {},
}: {
  onClick?: () => void;
  title?: string;
  variant?: "default" | "round";
  style?: CSSProperties;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: variant === "round" ? "34px" : "32px",
        height: variant === "round" ? "34px" : "32px",
        borderRadius: variant === "round" ? "var(--radius-pill)" : "var(--radius-md)",
        border: `var(--border-width) solid ${hover ? "var(--border-strong)" : "var(--border)"}`,
        background: "var(--card)",
        color: "var(--foreground)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        font: "600 14px var(--font-mono)",
        ...style,
      }}
    >
      {"✕"}
    </button>
  );
}

/**
 * ModalDialog — the focused overlay flow. Backdrop + centered surface +
 * CloseButton. Esc and backdrop click dismiss.
 * Ported from ds-a components/overlay/ModalDialog.jsx.
 */
export function ModalDialog({
  open = true,
  onClose,
  title,
  width = "min(1040px, 96vw)",
  height = "min(640px, 90vh)",
  children,
  style = {},
}: {
  open?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  width?: string;
  height?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: "22px",
      }}
    >
      <Backdrop onClick={onClose} style={{ position: "absolute" }} />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "relative",
          width,
          height,
          background: "var(--card)",
          border: "var(--border-width) solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--elevation-modal)",
          display: "flex",
          overflow: "hidden",
          animation: "ds-ovin var(--motion) var(--ease)",
          ...style,
        }}
      >
        <div style={{ position: "absolute", top: "14px", right: "14px", zIndex: 4 }}>
          <CloseButton onClick={onClose} variant="round" />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
            padding: "22px 26px 30px",
          }}
        >
          {title ? (
            <h3 style={{ font: "700 22px var(--font-sans)", margin: "0 0 18px" }}>{title}</h3>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
