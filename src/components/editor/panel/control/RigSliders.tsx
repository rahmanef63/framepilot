"use client";
// RigSliders — the KAMERA numeric controls (plan G5). Three groups:
//   · Rig            — az/el/dist derived from camPos via getOrbit + fov/roll
//   · Posisi Kamera  — raw camPos {x,y,z} world coordinates (setCamPos)
//   · Posisi Anchor  — raw target {x,y,z}, the point the camera aims/orbits (setTarget)
// Subject transform moved to <SubjectControls/> (SUBJEK tab). Sliders are
// imperative (ui/Slider) so a drag doesn't fight React for the value.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Slider } from "../../ui/Slider";
import { getOrbit, focalLength } from "@/lib/editorMath";

export function RigSliders() {
  const ctx = useEditor();
  const rig = ctx.rigRef.current;
  const o = getOrbit(rig.camPos, rig.target);
  const c = rig.camPos;
  const t = rig.target;

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
      </div>

      {/* ---- posisi kamera (raw camPos) ---- */}
      <div className="group">
        <h3>Posisi Kamera</h3>
        <Slider
          label="X"
          min={-15}
          max={15}
          step={0.1}
          value={c.x}
          format={(v) => `${v.toFixed(2)}m`}
          onInput={(v) => ctx.setCamPos("x", v)}
        />
        <Slider
          label="Y (tinggi)"
          min={0.05}
          max={15}
          step={0.05}
          value={c.y}
          format={(v) => `${v.toFixed(2)}m`}
          onInput={(v) => ctx.setCamPos("y", v)}
        />
        <Slider
          label="Z"
          min={-15}
          max={15}
          step={0.1}
          value={c.z}
          format={(v) => `${v.toFixed(2)}m`}
          onInput={(v) => ctx.setCamPos("z", v)}
        />
      </div>

      {/* ---- posisi anchor (raw target) ---- */}
      <div className="group">
        <h3>Posisi Anchor</h3>
        <Slider
          label="X"
          min={-8}
          max={8}
          step={0.1}
          value={t.x}
          format={(v) => `${v.toFixed(2)}m`}
          onInput={(v) => ctx.setTarget("x", v)}
        />
        <Slider
          label="Y (tinggi)"
          min={0.1}
          max={3}
          step={0.05}
          value={t.y}
          format={(v) => `${v.toFixed(2)}m`}
          onInput={(v) => ctx.setTarget("y", v)}
        />
        <Slider
          label="Z"
          min={-8}
          max={8}
          step={0.1}
          value={t.z}
          format={(v) => `${v.toFixed(2)}m`}
          onInput={(v) => ctx.setTarget("z", v)}
        />
      </div>
    </>
  );
}

export default RigSliders;
