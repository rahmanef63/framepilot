"use client";
// ToggleRow — the "Kamera · Toggle" cluster (plan G11). The two pure command
// buttons (Fokus Subjek, Reset) are ds/Button. The three state toggles keep the
// plain <button className="on"> form: they carry the .on accent state that
// ds/Button has no variant for.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { Button } from "@/components/ds/Button";

export function ToggleRow() {
  const ctx = useEditor();
  const { t } = useT();
  const { ui } = ctx;
  const rig = ctx.rigRef.current;

  return (
    <div className="group">
      <h3>{t("panel.cameraToggle")}</h3>
      <div className="chips">
        <Button variant="outline" size="sm" onClick={ctx.focusOnSubject}>
          {t("panel.focusSubject")}
        </Button>
        <button
          className={rig.trackSubject ? "on" : undefined}
          onClick={ctx.toggleTrackSubject}
        >
          {t("panel.targetLock", { s: rig.trackSubject ? "ON" : "OFF" })}
        </button>
        <button className={ui.thirdsOn ? "on" : undefined} onClick={ctx.toggleThirds}>
          {t("panel.gridThirds")}
        </button>
        <button className={ui.frustumOn ? "on" : undefined} onClick={ctx.toggleFrustum}>
          {t("panel.frustum")}
        </button>
        <Button variant="outline" size="sm" onClick={ctx.resetRig}>
          {t("panel.reset")}
        </Button>
      </div>
    </div>
  );
}
