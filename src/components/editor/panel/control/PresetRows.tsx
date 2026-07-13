"use client";
// PresetRows — the angle (G7), shot-size (G8) and lens (G9) preset chip rows.
// Chips are plain <button>s under .chips (styled by editor.css); they fire-and-apply
// a preset (momentary, never a persistent toggle) so no active/aria-pressed state.

import React from "react";
import { useEditor } from "@/state/EditorState";

// G7 · angle presets [el, roll]
const ANGLE_PRESETS: { label: string; el: number; roll: number }[] = [
  { label: "Eye", el: 0, roll: 0 },
  { label: "High", el: 35, roll: 0 },
  { label: "Low", el: -25, roll: 0 },
  { label: "Bird", el: 80, roll: 0 },
  { label: "Worm", el: -55, roll: 0 },
  { label: "Dutch", el: 5, roll: 18 },
];

// G8 · shot-size presets [r]
const SHOT_PRESETS: { label: string; r: number }[] = [
  { label: "ECU", r: 0.22 },
  { label: "CU", r: 0.45 },
  { label: "MCU", r: 0.75 },
  { label: "MS", r: 1.15 },
  { label: "FS", r: 1.8 },
  { label: "WS", r: 3.0 },
];

// G9 · lens presets [mm]
const LENS_PRESETS = [18, 24, 35, 50, 85, 135];

export function PresetRows() {
  const ctx = useEditor();
  return (
    <>
      {/* ---- angle presets (G7) ---- */}
      <div className="group">
        <h3>Sudut · Angle</h3>
        <div className="chips">
          {ANGLE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              title={`el ${p.el}° · roll ${p.roll}°`}
              onClick={() => ctx.applyAnglePreset(p.el, p.roll)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- shot-size presets (G8) ---- */}
      <div className="group">
        <h3>Ukuran Shot</h3>
        <div className="chips">
          {SHOT_PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => ctx.applyShotPreset(p.r)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- lens presets (G9) ---- */}
      <div className="group">
        <h3>Lensa</h3>
        <div className="chips">
          {LENS_PRESETS.map((mm) => (
            <button key={mm} type="button" onClick={() => ctx.applyLensPreset(mm)}>
              {mm}mm
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default PresetRows;
