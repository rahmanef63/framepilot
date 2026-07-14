import React from "react";

/**
 * BrandMark — the FramePilot logo mark, inlined from
 * `src/public/brand/framepilot-mark.svg` so its color + stroke follow the theme:
 * every path uses `currentColor`, so set the parent's `color` (e.g.
 * `var(--primary)`) and the mark repaints with the selected theme preset.
 * Viewfinder corners + an orbit arrow around a framed subject.
 */
export function BrandMark({
  size = 24,
  title = "FramePilot",
  strokeWidth = 5,
}: {
  size?: number;
  title?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      style={{ display: "block", flex: "none" }}
    >
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 8H12a4 4 0 0 0-4 4v8" />
        <path d="M44 8h8a4 4 0 0 1 4 4v8" />
        <path d="M8 44v8a4 4 0 0 0 4 4h8" />
        <path d="M56 44v8a4 4 0 0 1-4 4h-8" />
        <path d="M18 34c3-9 12-15 22-13 7 1 13 5 17 11" />
        <path d="m52 26 5 6-7 3" />
        <rect x="23" y="20" width="18" height="24" rx="2" />
        <circle cx="32" cy="31" r="2.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
