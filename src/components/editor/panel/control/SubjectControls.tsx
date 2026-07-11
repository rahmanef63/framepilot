"use client";
// SubjectControls — the "Subjek" segmented selector (plan G6 subject type).
// Prop-free: reads/writes the live rig through useEditor().

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Seg } from "../../ui/Seg";

const SUBJECT_OPTIONS: { value: "person" | "object"; label: string }[] = [
  { value: "person", label: "Orang" },
  { value: "object", label: "Objek" },
];

export function SubjectControls() {
  const ctx = useEditor();
  const rig = ctx.rigRef.current;
  return (
    <div className="group">
      <h3>Subjek</h3>
      <Seg options={SUBJECT_OPTIONS} value={rig.subj} onChange={ctx.setSubject} />
    </div>
  );
}

export default SubjectControls;
