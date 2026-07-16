import React, { ReactNode } from "react";

/**
 * IconChip — the small bordered square that frames a menu/nav glyph (a mono
 * label or a lucide icon). Shared by NavItem, CreateMenu, NavUserMenu and the
 * editor action menu, which previously inlined identical <span>s. Two sizes: the
 * 24px rail tile (10px font) and the default 26px menu row (11px font); the font
 * tracks the box via size/2 - 2. Extra props (e.g. aria-hidden) pass through.
 */
export function IconChip({
  size = 26,
  children,
  ...rest
}: {
  size?: number;
  children: ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...rest}
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: 7,
        border: "var(--border-width) solid var(--border)",
        display: "grid",
        placeItems: "center",
        font: `600 ${size / 2 - 2}px var(--font-mono)`,
        color: "var(--subtle-foreground)",
      }}
    >
      {children}
    </span>
  );
}
