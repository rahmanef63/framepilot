"use client";
// PresetRows — the angle (G7), shot-size (G8) and lens (G9) preset chip rows.
// Chips are plain <button>s under .chips (styled by editor.css); they fire-and-apply
// a preset (momentary, never a persistent toggle) so no active/aria-pressed state.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { ANGLE_PRESETS, SHOT_PRESETS, LENS_PRESETS } from "@/lib/editor/presets";

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
