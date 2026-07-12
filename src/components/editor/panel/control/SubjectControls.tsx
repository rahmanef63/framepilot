"use client";
// SubjectControls — the SUBJEK tab body: the subject-type segmented selector
// (plan G6) plus the subject-transform sliders (G6: rotasi + posisi X/Z), moved
// here out of RigSliders so camera and subject controls live in separate tabs.
// Prop-free: reads/writes the live rig through useEditor().

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Seg } from "../../ui/Seg";
import { Slider } from "../../ui/Slider";

const SUBJECT_OPTIONS: { value: "person" | "object"; label: string }[] = [
  { value: "person", label: "Orang" },
  { value: "object", label: "Objek" },
];

export function SubjectControls() {
  const ctx = useEditor();
  const rig = ctx.rigRef.current;
  return (
    <>
      <div className="group">
        <h3>Subjek</h3>
        <Seg options={SUBJECT_OPTIONS} value={rig.subj} onChange={ctx.setSubject} />
      </div>

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

export default SubjectControls;
