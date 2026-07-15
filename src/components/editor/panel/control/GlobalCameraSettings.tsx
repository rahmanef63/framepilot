"use client";
// GlobalCameraSettings — the "set the camera once" toggle + project camera <select>.
// ON = settings.camera applies to every frame (the per-frame CameraSelect goes
// disabled); OFF = each frame picks its own. Lives with project.settings (aspect/fps
// in the Viewport tab). The toggle reuses the ToggleRow .on accent-button pattern.

import React from "react";
import { Camera } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { CAMERAS, cameraById } from "@/lib/cameras";

const hint: React.CSSProperties = { font: "400 11px var(--e-sans)", color: "var(--muted)", margin: "5px 0 0" };

export function GlobalCameraSettings() {
  const ctx = useEditor();
  const { t } = useT();
  const settings = ctx.project.settings;
  const global = settings.globalCamera;
  const preset = cameraById(settings.camera);

  return (
    <div className="group">
      <h3>{t("panel.globalCamera")}</h3>
      <div className="chips">
        <button className={global ? "on" : undefined} onClick={() => ctx.setGlobalCamera(!global)}>
          {t("panel.globalCameraToggle", { s: global ? "ON" : "OFF" })}
        </button>
      </div>
      <div className="field">
        <label>{t("panel.cameraForAllFrames")}</label>
        <select
          value={settings.camera}
          disabled={!global}
          onChange={(e) => ctx.setProjectCamera(e.target.value)}
        >
          {CAMERAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id === "" ? t("view.noCameraGeneric") : c.label}
            </option>
          ))}
        </select>
        {preset?.look ? <p style={hint}><Camera size={13} aria-hidden /> {preset.sensor} · {preset.look}</p> : null}
        <p style={hint}>
          {global
            ? t("panel.allFramesUseCamera")
            : t("panel.globalCameraHint")}
        </p>
      </div>
    </div>
  );
}
