"use client";
// PromptOptionsMenu.tsx — the "Detail prompt" dropdown of checkboxes. Each box
// toggles ONE clause of the camera prompt (lens, geometry, move, framing…) and
// the shown/copied prompt rebuilds live via the shared usePromptOptions store.
// Native <details> = the dropdown (no outside-click JS, closes itself, a11y-ok).

import React from "react";
import { usePromptOptions } from "./usePromptOptions";
import type { ShotOptions } from "@/lib/prompt/types";
import "./prompt-options.css";

const ROWS: { key: keyof ShotOptions; label: string }[] = [
  { key: "lens", label: "Lensa (mm)" },
  { key: "dof", label: "Depth of field" },
  { key: "elevation", label: "Elevasi / sudut" },
  { key: "view", label: "Arah hadap (azimuth)" },
  { key: "distance", label: "Jarak kamera" },
  { key: "height", label: "Tinggi kamera" },
  { key: "dutch", label: "Dutch tilt" },
  { key: "move", label: "Gerakan kamera" },
  { key: "framing", label: "Rasio (framing)" },
];

export function PromptOptionsMenu() {
  const [opts, set] = usePromptOptions();
  const on = ROWS.filter((r) => opts[r.key]).length;

  return (
    <details className="cam-opts">
      <summary title="Pilih detail yang ikut ke dalam prompt">
        <span className="cam-opts__title">Detail prompt</span>
        <span className="cam-opts__count">
          {on}/{ROWS.length}
        </span>
        <span className="cam-opts__chevron" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="cam-opts__menu" role="group" aria-label="Detail prompt kamera">
        {ROWS.map((r) => (
          <label key={r.key} className="cam-opts__row">
            <input
              type="checkbox"
              checked={opts[r.key]}
              onChange={(e) => set(r.key, e.target.checked)}
            />
            <span>{r.label}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

export default PromptOptionsMenu;
