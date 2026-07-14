"use client";
// ToggleRow — the "Kamera · Toggle" cluster (plan G11). The two pure command
// buttons (Fokus Subjek, Reset) are ds/Button. The three state toggles keep the
// plain <button className="on"> form: they carry the .on accent state that
// ds/Button has no variant for.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Button } from "@/components/ds/Button";

export function ToggleRow() {
  const ctx = useEditor();
  const { ui } = ctx;
  const rig = ctx.rigRef.current;

  return (
    <div className="group">
      <h3>Kamera · Toggle</h3>
      <div className="chips">
        <Button variant="outline" size="sm" onClick={ctx.focusOnSubject}>
          Fokus Subjek
        </Button>
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
        <Button variant="outline" size="sm" onClick={ctx.resetRig}>
          Reset
        </Button>
      </div>
    </div>
  );
}
