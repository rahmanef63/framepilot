"use client";
// ControlPanel.tsx — the Kontrol panel (plan G5–G11, G15). Drives the live rig
// through useEditor() action methods: the 6 camera sliders + 3 subject sliders,
// angle/shot/lens preset chips, subject Seg, camera toggles, and the OutputFrame
// (aspect + fps). az/el/dist are derived from camPos via getOrbit each render and
// written back via ctx.orbit (setOrbit re-clamps). Sliders are imperative
// (ui/Slider) so a drag doesn't fight React for the input value.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Slider } from "../ui/Slider";
import { Seg } from "../ui/Seg";
import { Chip, Chips } from "../ui/Chip";
import { getOrbit, focalLength } from "@/lib/editorMath";
import { ARS, FPS } from "@/lib/dataPrompt";

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

const SUBJECT_OPTIONS: { value: "person" | "object"; label: string }[] = [
  { value: "person", label: "Orang" },
  { value: "object", label: "Objek" },
];

export function ControlPanel() {
  const ctx = useEditor();
  const { ui } = ctx;
  const rig = ctx.rigRef.current;
  const o = getOrbit(rig.camPos, rig.target);

  return (
    <div className="panel-page active">
      {/* ---- subject ---- */}
      <div className="group">
        <h3>Subjek</h3>
        <Seg options={SUBJECT_OPTIONS} value={rig.subj} onChange={ctx.setSubject} />
      </div>

      {/* ---- camera rig (G5) ---- */}
      <div className="group">
        <h3>Kamera · Rig</h3>
        <Slider
          label="Azimuth"
          min={0}
          max={360}
          step={1}
          value={o.az}
          format={(v) => `${Math.round(v)}°`}
          onInput={(v) => ctx.orbit(v, o.el, o.dist)}
        />
        <Slider
          label="Elevasi"
          min={-85}
          max={88}
          step={1}
          value={o.el}
          format={(v) => `${Math.round(v)}°`}
          onInput={(v) => ctx.orbit(o.az, v, o.dist)}
        />
        <Slider
          label="Jarak"
          min={0.4}
          max={20}
          step={0.1}
          value={o.dist}
          format={(v) => `${v.toFixed(1)}m`}
          onInput={(v) => ctx.orbit(o.az, o.el, v)}
        />
        <Slider
          label="FOV / Lensa"
          min={12}
          max={100}
          step={1}
          value={rig.fov}
          format={(v) => `${Math.round(v)}° · ${focalLength(v)}mm`}
          onInput={(v) => ctx.setFov(v)}
        />
        <Slider
          label="Roll"
          min={-45}
          max={45}
          step={1}
          value={rig.roll}
          format={(v) => `${Math.round(v)}°`}
          onInput={(v) => ctx.setRoll(v)}
        />
        <Slider
          label="Target Y"
          min={0.1}
          max={3}
          step={0.05}
          value={rig.target.y}
          format={(v) => `${v.toFixed(2)}m`}
          onInput={(v) => ctx.setTargetY(v)}
        />
      </div>

      {/* ---- subject transform (G6) ---- */}
      <div className="group">
        <h3>Subjek · Transform</h3>
        <Slider
          label="Rotasi"
          min={-180}
          max={180}
          step={5}
          value={rig.subjRot}
          format={(v) => `${Math.round(v)}°`}
          onInput={(v) => ctx.setSubjRot(v)}
        />
        <Slider
          label="Posisi X"
          min={-6}
          max={6}
          step={0.1}
          value={rig.subjPos.x}
          format={(v) => v.toFixed(1)}
          onInput={(v) => ctx.setSubjX(v)}
        />
        <Slider
          label="Posisi Z"
          min={-6}
          max={6}
          step={0.1}
          value={rig.subjPos.z}
          format={(v) => v.toFixed(1)}
          onInput={(v) => ctx.setSubjZ(v)}
        />
      </div>

      {/* ---- angle presets (G7) ---- */}
      <div className="group">
        <h3>Sudut · Angle</h3>
        <Chips>
          {ANGLE_PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={p.label}
              title={`el ${p.el}° · roll ${p.roll}°`}
              onClick={() => ctx.applyAnglePreset(p.el, p.roll)}
            />
          ))}
        </Chips>
      </div>

      {/* ---- shot-size presets (G8) ---- */}
      <div className="group">
        <h3>Ukuran Shot</h3>
        <Chips>
          {SHOT_PRESETS.map((p) => (
            <Chip key={p.label} label={p.label} onClick={() => ctx.applyShotPreset(p.r)} />
          ))}
        </Chips>
      </div>

      {/* ---- lens presets (G9) ---- */}
      <div className="group">
        <h3>Lensa</h3>
        <Chips>
          {LENS_PRESETS.map((mm) => (
            <Chip key={mm} label={`${mm}mm`} onClick={() => ctx.applyLensPreset(mm)} />
          ))}
        </Chips>
      </div>

      {/* ---- toggles (G11) ---- */}
      <div className="group">
        <h3>Kamera · Toggle</h3>
        <div className="chips">
          <button onClick={ctx.focusOnSubject}>Fokus Subjek</button>
          <button
            className={rig.trackSubject ? "on" : undefined}
            onClick={ctx.toggleTrackSubject}
          >
            Target Lock · {rig.trackSubject ? "ON" : "OFF"}
          </button>
          <button className={ui.thirdsOn ? "on" : undefined} onClick={ctx.toggleThirds}>
            Grid ⅓
          </button>
          <button className={ui.frustumOn ? "on" : undefined} onClick={ctx.toggleFrustum}>
            Frustum
          </button>
          <button onClick={ctx.resetRig}>Reset</button>
        </div>
      </div>

      {/* ---- output frame (G15) ---- */}
      <div className="group">
        <h3>Output Frame</h3>
        <div className="field-row">
          <div className="field">
            <label>Rasio Aspek</label>
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
    </div>
  );
}

export default ControlPanel;
