"use client";
// SubjectControls — the SUBJEK tab body: the subject-type segmented selector
// (plan G6) plus the subject-transform sliders (G6: rotasi + posisi X/Z), moved
// here out of RigSliders so camera and subject controls live in separate tabs.
// Prop-free: reads/writes the live rig through useEditor().

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { Seg } from "../../ui/Seg";
import { Slider } from "../../ui/Slider";

const SUBJECT_OPTIONS: { value: "person" | "object"; labelKey: string }[] = [
  { value: "person", labelKey: "panel.subjectPerson" },
  { value: "object", labelKey: "panel.subjectObject" },
];

export function SubjectControls() {
  const ctx = useEditor();
  const { t } = useT();
  const rig = ctx.rigRef.current;
  const subjectOptions = SUBJECT_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }));
  return (
    <>
      <div className="group">
        <h3>{t("panel.tabSubject")}</h3>
        <Seg options={subjectOptions} value={rig.subj} onChange={ctx.setSubject} />
      </div>

      <div className="group">
        <h3>{t("panel.subjectTransform")}</h3>
        <Slider
          label={t("panel.rotation")}
          min={-180}
          max={180}
          step={5}
          value={rig.subjRot}
          format={(v) => `${Math.round(v)}°`}
          onInput={(v) => ctx.setSubjRot(v)}
        />
        <Slider
          label={t("panel.posX")}
          min={-6}
          max={6}
          step={0.1}
          value={rig.subjPos.x}
          format={(v) => v.toFixed(1)}
          onInput={(v) => ctx.setSubjX(v)}
        />
        <Slider
          label={t("panel.posZ")}
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
