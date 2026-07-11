"use client";
import React from "react";
import { NavItem } from "@/components/ds/NavItem";

/**
 * CreateMenu — the "Buat" (create) affordance rendered as a dropdown.
 * Trigger reuses the ds NavItem (so it matches the rest of the rail in both
 * orientations); the menu is a lightweight token-styled popover that closes on
 * outside-click and Esc. Two options: start a new Studio 3D project, or start
 * from an uploaded image (opens the import flow on the photo tab).
 */
export function CreateMenu({
  orientation,
  onNew3D,
  onFromImage,
}: {
  orientation: "horizontal" | "vertical";
  onNew3D: () => void;
  onFromImage: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  const toggle = () => {
    if (wrapRef.current) setRect(wrapRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  };

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  // Fixed-position popover anchored off the trigger's rect so it never gets
  // clipped by the sidebar's overflow: below the trigger when the sidebar is
  // expanded, to the right of the collapsed rail tile otherwise.
  const menuPos: React.CSSProperties = rect
    ? orientation === "horizontal"
      ? { top: rect.bottom + 4, left: rect.left, width: rect.width }
      : { top: rect.top, left: rect.right + 8, width: 190 }
    : {};

  return (
    <div ref={wrapRef} style={{ position: "relative", width: orientation === "horizontal" ? "100%" : undefined }}>
      <NavItem
        orientation={orientation}
        icon="+"
        label="Buat"
        accent
        active={open}
        chevron={orientation === "horizontal"}
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
            gap: "2px",
            padding: "6px",
            background: "var(--card)",
            border: "var(--border-width) solid var(--border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow, 0 8px 24px rgba(0,0,0,.16))",
            ...menuPos,
          }}
        >
          <MenuOption
            icon="◈"
            title="Susun di Studio 3D"
            desc="Rancang kamera → Prompt Kamera"
            onClick={() => pick(onNew3D)}
          />
          <MenuOption
            icon="▧"
            title="Impor dari Gambar"
            desc="Foto → ekstrak data kamera"
            onClick={() => pick(onFromImage)}
          />
        </div>
      ) : null}
    </div>
  );
}

function MenuOption({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
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
        gap: "10px",
        width: "100%",
        textAlign: "left",
        border: 0,
        borderRadius: "var(--radius-sm)",
        padding: "8px 9px",
        cursor: "pointer",
        background: hover ? "var(--muted)" : "transparent",
        color: "var(--foreground)",
      }}
    >
      <span
        style={{
          width: "26px",
          height: "26px",
          flex: "none",
          borderRadius: "7px",
          border: "var(--border-width) solid var(--border)",
          display: "grid",
          placeItems: "center",
          font: "600 11px var(--font-mono)",
          color: "var(--subtle-foreground)",
        }}
      >
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
        <span style={{ font: "700 12.5px var(--font-sans)", color: "var(--foreground)" }}>{title}</span>
        <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--muted-foreground)" }}>{desc}</span>
      </span>
    </button>
  );
}
