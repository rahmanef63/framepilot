"use client";
// OutputFrame — the "Output Frame" group (plan G15): aspect-ratio + fps selects.
// Native <select> elements styled by editor.css .field — no action buttons here.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { ARS, FPS } from "@/lib/dataPrompt";

export function OutputFrame() {
  const ctx = useEditor();
  const { t } = useT();
  return (
    <div className="group">
      <h3>{t("panel.outputFrame")}</h3>
      <div className="field-row">
        <div className="field">
          <label>{t("panel.aspectRatio")}</label>
          <select
            value={ctx.project.settings.aspectRatio}
            onChange={(e) => ctx.setAspect(e.target.value)}
          >
            {ARS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>FPS</label>
          <select
            value={String(ctx.project.settings.fps)}
            onChange={(e) => ctx.setFps(+e.target.value)}
          >
            {FPS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
