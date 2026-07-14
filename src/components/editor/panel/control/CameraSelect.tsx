"use client";
// CameraSelect — the PER-FRAME camera dropdown (a prompt "shot on <brand>" look
// tag). Native <select> in a .field (OutputFrame pattern). When the project's
// global-camera toggle is on, this is disabled + reflects the global pick, so the
// user sees why their per-frame choice is inert. Prompt-only — no 3D effect.

import React from "react";
import { Camera } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { CAMERAS, cameraById } from "@/lib/cameras";

const hint: React.CSSProperties = { font: "400 11px var(--e-sans)", color: "var(--muted)", margin: "5px 0 0" };

export function CameraSelect() {
  const ctx = useEditor();
  const settings = ctx.project.settings;
  const current = ctx.currentFrame();
  const global = settings.globalCamera;
  const value = global ? settings.camera : current?.camera ?? "";
  const disabled = global || !current;
  const preset = cameraById(value);

  return (
    <div className="group">
      <h3>Kamera (brand)</h3>
      <div className="field">
        <label>Kamera frame ini</label>
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => current && ctx.setFrameCamera(current.id, e.target.value)}
        >
          {CAMERAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {preset?.look ? <p style={hint}><Camera size={13} aria-hidden /> {preset.sensor} · {preset.look}</p> : null}
        {global ? (
          <p style={hint}>Ikut kamera global — atur di Viewport.</p>
        ) : !current ? (
          <p style={hint}>Pilih atau buat frame dulu.</p>
        ) : null}
      </div>
    </div>
  );
}
