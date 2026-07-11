"use client";
// Chip — a preset pill (concept .chips button). Prop-driven; uses editor.css classes.
import React from "react";

export function Chip({
  label,
  active = false,
  title,
  onClick,
}: {
  label: string;
  active?: boolean;
  title?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "active" : undefined}
      title={title}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Chips — thin row wrapper so callers can map presets declaratively.
export function Chips({ children }: { children: React.ReactNode }) {
  return <div className="chips">{children}</div>;
}
