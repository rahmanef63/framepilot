// editor/rig.ts — rig mutators + angle/shot/lens presets. Every mutation runs
// through afterRigMutate (sync engine, refresh HUD, mark dirty, schedule commit).
// afterRigMutate is returned so the ui group's toggleTrackSubject can reuse it.

import { useCallback } from "react";
import {
  getOrbit,
  setOrbit,
  subjHeight,
  shotDistance,
  fovFromFocal,
  clamp,
} from "@/lib/editorMath";
import { tr } from "@/i18n";
import type { EditorCore } from "./core";

export interface RigActions {
  afterRigMutate: (label: string) => void;
  orbit: (az: number, el: number, dist: number) => void;
  setFov: (v: number) => void;
  setRoll: (v: number) => void;
  setTargetY: (v: number) => void;
  setCamPos: (axis: "x" | "y" | "z", v: number) => void;
  setTarget: (axis: "x" | "y" | "z", v: number) => void;
  setSubjRot: (v: number) => void;
  setSubjX: (v: number) => void;
  setSubjZ: (v: number) => void;
  setSubject: (subj: "person" | "object") => void;
  applyAnglePreset: (el: number, roll: number) => void;
  applyShotPreset: (r: number) => void;
  applyLensPreset: (mm: number) => void;
  focusOnSubject: () => void;
  resetRig: () => void;
  onRigChangedFromEngine: () => void;
}

export function useRigActions(
  core: EditorCore,
  deps: {
    stopPlayback: () => void;
    scheduleHistoryCommit: (label?: string, delay?: number) => void;
  }
): RigActions {
  const { rigRef, engineRef, syncRig, bump } = core;
  const { stopPlayback, scheduleHistoryCommit } = deps;

  const afterRigMutate = useCallback(
    (label: string) => {
      syncRig();
      engineRef.current?.updateHud();
      bump();
      scheduleHistoryCommit(label);
    },
    [engineRef, syncRig, bump, scheduleHistoryCommit]
  );

  const orbit = useCallback(
    (az: number, el: number, dist: number) => {
      stopPlayback();
      const rig = rigRef.current;
      rig.camPos = setOrbit(az, el, dist, rig.target);
      afterRigMutate(tr("state.hist.orbit"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );

  const setFov = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.fov = v;
      afterRigMutate(tr("state.hist.fov"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );
  const setRoll = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.roll = v;
      afterRigMutate(tr("state.hist.roll"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );
  const setTargetY = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.target.y = v;
      afterRigMutate(tr("state.hist.targetY"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );
  // Raw world-space setters for the KAMERA inspector's "Posisi kamera" /
  // "Posisi anchor" number controls. camPos.y is clamped to the engine's
  // [0.05, 25] range (concept clamp); orbit sliders re-derive from camPos.
  const setCamPos = useCallback(
    (axis: "x" | "y" | "z", v: number) => {
      stopPlayback();
      rigRef.current.camPos[axis] = axis === "y" ? clamp(v, 0.05, 25) : v;
      afterRigMutate(tr("state.hist.camPos"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );
  const setTarget = useCallback(
    (axis: "x" | "y" | "z", v: number) => {
      stopPlayback();
      rigRef.current.target[axis] = v;
      afterRigMutate(tr("state.hist.anchorPos"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );

  const setSubjRot = useCallback(
    (v: number) => {
      stopPlayback();
      rigRef.current.subjRot = v;
      afterRigMutate(tr("state.hist.subjRot"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );
  const setSubjX = useCallback(
    (v: number) => {
      stopPlayback();
      const rig = rigRef.current;
      rig.subjPos.x = v;
      if (rig.trackSubject) rig.target.x = v;
      afterRigMutate(tr("state.hist.subjPos"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );
  const setSubjZ = useCallback(
    (v: number) => {
      stopPlayback();
      const rig = rigRef.current;
      rig.subjPos.z = v;
      if (rig.trackSubject) rig.target.z = v;
      afterRigMutate(tr("state.hist.subjPos"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );

  const setSubject = useCallback(
    (subj: "person" | "object") => {
      stopPlayback();
      const rig = rigRef.current;
      rig.subj = subj;
      rig.target.y = subj === "person" ? 1.35 : 1.0;
      engineRef.current?.setSubject(subj);
      afterRigMutate(tr("state.hist.changeSubject"));
    },
    [rigRef, engineRef, stopPlayback, afterRigMutate]
  );

  const applyAnglePreset = useCallback(
    (el: number, roll: number) => {
      stopPlayback();
      const rig = rigRef.current;
      const o = getOrbit(rig.camPos, rig.target);
      rig.roll = roll;
      rig.camPos = setOrbit(o.az, el, o.dist, rig.target);
      afterRigMutate(tr("state.hist.presetAngle"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );

  const applyShotPreset = useCallback(
    (r: number) => {
      stopPlayback();
      const rig = rigRef.current;
      const o = getOrbit(rig.camPos, rig.target);
      const d = shotDistance(r, rig.fov, subjHeight(rig.subj));
      rig.camPos = setOrbit(o.az, o.el, d, rig.target);
      afterRigMutate(tr("state.hist.presetShot"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );

  const applyLensPreset = useCallback(
    (mm: number) => {
      stopPlayback();
      rigRef.current.fov = clamp(fovFromFocal(mm), 12, 100);
      afterRigMutate(tr("state.hist.presetLens"));
    },
    [rigRef, stopPlayback, afterRigMutate]
  );

  const focusOnSubject = useCallback(() => {
    stopPlayback();
    const rig = rigRef.current;
    const o = getOrbit(rig.camPos, rig.target);
    rig.target.x = rig.subjPos.x;
    rig.target.z = rig.subjPos.z;
    rig.camPos = setOrbit(o.az, o.el, o.dist, rig.target);
    afterRigMutate(tr("state.hist.focusSubject"));
  }, [rigRef, stopPlayback, afterRigMutate]);

  const resetRig = useCallback(() => {
    stopPlayback();
    const rig = rigRef.current;
    rig.subjPos = { x: 0, z: 0 };
    rig.subjRot = 0;
    rig.fov = 40;
    rig.roll = 0;
    rig.target = { x: 0, y: rig.subj === "person" ? 1.35 : 1.0, z: 0 };
    rig.camPos = setOrbit(30, 4, 3, rig.target);
    rig.trackSubject = false;
    afterRigMutate(tr("state.hist.resetRig"));
  }, [rigRef, stopPlayback, afterRigMutate]);

  const onRigChangedFromEngine = useCallback(() => {
    rigRef.current = engineRef.current ? engineRef.current.getRig() : rigRef.current;
    bump();
    scheduleHistoryCommit(tr("state.hist.moveCamera"));
  }, [rigRef, engineRef, bump, scheduleHistoryCommit]);

  return {
    afterRigMutate,
    orbit,
    setFov,
    setRoll,
    setTargetY,
    setCamPos,
    setTarget,
    setSubjRot,
    setSubjX,
    setSubjZ,
    setSubject,
    applyAnglePreset,
    applyShotPreset,
    applyLensPreset,
    focusOnSubject,
    resetRig,
    onRigChangedFromEngine,
  };
}
