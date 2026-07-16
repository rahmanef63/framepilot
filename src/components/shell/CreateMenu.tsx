"use client";
import React from "react";
import { NavItem } from "@/components/ds/NavItem";
import { IconChip } from "@/components/ds/IconChip";
import { useDismiss } from "@/components/shell/useDismiss";
import { useT } from "@/i18n";
import { Plus, Camera, Image, LayoutTemplate } from "lucide-react";

/**
 * CreateMenu — the "Buat" (create) affordance rendered as a dropdown.
 * Trigger reuses the ds NavItem (so it matches the rest of the rail in both
 * orientations); the menu is a lightweight token-styled popover that closes on
 * outside-click and Esc. Three options: start a new Studio 3D project, start
 * from an uploaded image (opens the import flow on the photo tab), or start
 * from a template (presets now live in the merged Pustaka/library).
 */
export function CreateMenu({
  orientation,
  onNew3D,
  onFromImage,
  onFromTemplate,
  fill = true,
}: {
  orientation: "horizontal" | "vertical";
  onNew3D: () => void;
  onFromImage: () => void;
  onFromTemplate: () => void;
  /** horizontal trigger stretches full-width (sidebar) when true; auto-width (header nav) when false. */
  fill?: boolean;
}) {
  const { t } = useT();
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  const toggle = () => {
    if (wrapRef.current) setRect(wrapRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  };

  useDismiss(wrapRef, open, setOpen);

  const pick = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  // Fixed-position popover anchored off the trigger's rect so it never gets
  // clipped by the sidebar's overflow: below the trigger when the sidebar is
  // expanded, to the right of the collapsed rail tile otherwise.
  const menuPos: React.CSSProperties = rect
    ? orientation === "horizontal"
      ? { top: rect.bottom + 4, left: rect.left, width: fill ? rect.width : 210 }
      : { top: rect.top, left: rect.right + 8, width: 190 }
    : {};

  return (
    <div ref={wrapRef} style={{ position: "relative", width: orientation === "horizontal" && fill ? "100%" : undefined }}>
      <NavItem
        orientation={orientation}
        icon={<Plus size={16} />}
        label={t("shell.create.trigger")}
        accent
        active={open}
        chevron={orientation === "horizontal"}
        ariaHasPopup="menu"
        ariaExpanded={open}
        onClick={toggle}
        style={orientation === "horizontal" ? { width: fill ? "100%" : "auto" } : undefined}
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
            boxShadow: "var(--elevation-overlay)",
            ...menuPos,
          }}
        >
          <MenuOption
            icon={<Camera size={16} />}
            title={t("shell.create.new3d.title")}
            desc={t("shell.create.new3d.desc")}
            onClick={() => pick(onNew3D)}
          />
          <MenuOption
            icon={<Image size={16} />}
            title={t("shell.create.fromImage.title")}
            desc={t("shell.create.fromImage.desc")}
            onClick={() => pick(onFromImage)}
          />
          <MenuOption
            icon={<LayoutTemplate size={16} />}
            title={t("shell.create.fromTemplate.title")}
            desc={t("shell.create.fromTemplate.desc")}
            onClick={() => pick(onFromTemplate)}
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
  icon: React.ReactNode;
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
      <IconChip aria-hidden>{icon}</IconChip>
      <span style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
        <span style={{ font: "700 12.5px var(--font-sans)", color: "var(--foreground)" }}>{title}</span>
        <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--muted-foreground)" }}>{desc}</span>
      </span>
    </button>
  );
}
