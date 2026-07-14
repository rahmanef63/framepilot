"use client";
// GlobalCameraSettings — the "set the camera once" toggle + project camera <select>.
// ON = settings.camera applies to every frame (the per-frame CameraSelect goes
// disabled); OFF = each frame picks its own. Lives with project.settings (aspect/fps
// in the Viewport tab). The toggle reuses the ToggleRow .on accent-button pattern.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { CAMERAS, cameraById } from "@/lib/cameras";

const hint: React.CSSProperties = { font: "400 11px var(--e-sans)", color: "var(--muted)", margin: "5px 0 0" };

export function GlobalCameraSettings() {
  const ctx = useEditor();
  const settings = ctx.project.settings;
  const global = settings.globalCamera;
  const preset = cameraById(settings.camera);

  return (
    <div className="group">
      <h3>Kamera Global</h3>
      <div className="chips">
        <button className={global ? "on" : undefined} onClick={() => ctx.setGlobalCamera(!global)}>
          Kamera global · {global ? "ON" : "OFF"}
        </button>
      </div>
      <div className="field">
        <label>Kamera untuk semua frame</label>
        <select
          value={settings.camera}
          disabled={!global}
          onChange={(e) => ctx.setProjectCamera(e.target.value)}
        >
          {CAMERAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {preset?.look ? <p style={hint}>◈ {preset.sensor} · {preset.look}</p> : null}
        <p style={hint}>
          {global
            ? "Semua frame pakai kamera ini."
            : "Aktifkan untuk satu kamera di semua frame; jika mati, tiap frame pilih sendiri."}
        </p>
      </div>
    </div>
  );
}
