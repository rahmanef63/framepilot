"use client";
// RigSliders — the numeric rig controls: the 6 camera-rig sliders (plan G5) plus
// the 3 subject-transform sliders (G6). az/el/dist are derived from camPos via
// getOrbit each render and written back through ctx.orbit (setOrbit re-clamps).
// Sliders are imperative (ui/Slider) so a drag doesn't fight React for the value.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Slider } from "../../ui/Slider";
import { getOrbit, focalLength } from "@/lib/editorMath";

export function RigSliders() {
  const ctx = useEditor();
  const rig = ctx.rigRef.current;
  const o = getOrbit(rig.camPos, rig.target);

  return (
    <>
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
    </>
  );
}

export default RigSliders;
