"use client";
// PlatformPicker.tsx — the shared target-platform selector (ds-styled native
// <select>) + the tiny per-platform hint from platform.note. Reused by the
// Studio Prompt Kamera dock and the Full Preview panel so both reskin the same
// camera prompt live against the same @/lib/prompt/platforms SSOT.

import React from "react";
import { PLATFORMS } from "@/lib/prompt/platforms";
import type { PlatformId } from "@/lib/prompt/types";

export function PlatformSelect({
  value,
  onChange,
}: {
  value: PlatformId;
  onChange: (id: PlatformId) => void;
}) {
  return (
    <label className="cam-plat">
      <span>Platform</span>
      <select value={value} onChange={(e) => onChange(e.target.value as PlatformId)} title="Platform AI video tujuan">
        {PLATFORMS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
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
