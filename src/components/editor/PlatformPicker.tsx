"use client";
// PlatformPicker.tsx — the shared target-platform selector (ds-styled native
// <select>) + the tiny per-platform hint from platform.note. Reused by the
// Studio Prompt Kamera dock and the Full Preview panel so both reskin the same
// camera prompt live against the same @/lib/prompt/platforms SSOT.

import React from "react";
import { ChevronDown } from "lucide-react";
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
    <label className="cam-plat-picker" data-tour="platform">
      <span className="cam-plat-picker__label">Platform</span>
      <span className="cam-plat-select-wrap">
        <select
          className="cam-plat-select"
          aria-label="Platform AI video tujuan"
          value={value}
          onChange={(e) => onChange(e.target.value as PlatformId)}
        >
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id} title={p.note}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="cam-plat-select__chevron" aria-hidden="true">
          <ChevronDown size={14} />
        </span>
      </span>
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
