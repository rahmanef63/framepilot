"use client";
// PlatformPicker.tsx — the shared target-platform selector (ds-styled native
// <select>) + the tiny per-platform hint from platform.note. Reused by the
// Studio Prompt Kamera dock and the Full Preview panel so both reskin the same
// camera prompt live against the same @/lib/prompt/platforms SSOT.

import React from "react";
import { PLATFORMS } from "@/lib/prompt/platforms";
import type { PlatformId } from "@/lib/prompt/types";
import "./platform-picker.css";

export function PlatformSelect({
  value,
  onChange,
}: {
  value: PlatformId;
  onChange: (id: PlatformId) => void;
}) {
  return (
    <div className="cam-plat-picker" role="radiogroup" aria-label="Platform AI video tujuan">
      <span className="cam-plat-picker__label">Platform</span>
      <div className="cam-plat-picker__chips">
        {PLATFORMS.map((p) => {
          const active = p.id === value;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-pressed={active}
              title={p.note}
              className={`cam-plat-chip${active ? " is-active" : ""}`}
              onClick={() => onChange(p.id)}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// The one-line encoding hint for the active platform (platform.note).
export function PlatformHint({ value }: { value: PlatformId }) {
  const p = PLATFORMS.find((x) => x.id === value);
  if (!p) return null;
  return (
    <p className="cam-hint">
      <b>{p.label}:</b> {p.note}
    </p>
  );
}
