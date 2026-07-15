"use client";
// ShotBrief — the optional 6-field shot brief (intent · movement · action ·
// lighting · style · audio) bound to draftMeta, plus the live shot summary. Bare
// (no <details> wrapper) so callers place it where they want: ShotPanel wraps it
// in a collapsed <details> on desktop; MobilePanel gives it its own accordion.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import { MOVES } from "@/lib/dataPrompt";
import { frameDuration } from "@/lib/editorModel";
import { getOrbit, shotLabel, focalLength, subjHeight } from "@/lib/editorMath";

export function ShotBrief() {
  const ctx = useEditor();
  const { t } = useT();
  const m = ctx.draftMeta;
  const set = ctx.setDraftMetaField;
  const frame = ctx.currentFrame();
  const dirty = ctx.frameIsDirty(frame);
  const rig = ctx.rigRef.current;
  const o = getOrbit(rig.camPos, rig.target);

  return (
    <>
      <div className="shot-summary" id="shotSummary">
        {frame ? (
          <>
            <b>{frame.name}</b> · {frame.shot || shotLabel(o.dist, rig.fov, subjHeight(rig.subj))}{" "}
            · {String(frame.lens || focalLength(rig.fov))}mm ·{" "}
            {frameDuration({ ...frame, meta: m }).toFixed(1)}s
            <br />
            {dirty
              ? t("panel.frameDirty")
              : t("panel.frameClean")}
          </>
        ) : (
          t("panel.noActiveFrame")
        )}
      </div>

      <div className="field">
        <label htmlFor="shotIntent">{t("panel.shotIntent")}</label>
        <input
          id="shotIntent"
          type="text"
          placeholder={t("panel.shotIntentPlaceholder")}
          value={m.intent}
          onChange={(e) => set("intent", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="shotMovement">{t("panel.cameraMovement")}</label>
        <select id="shotMovement" value={m.movement} onChange={(e) => set("movement", e.target.value)}>
          {!MOVES.includes(m.movement) && <option value={m.movement}>{m.movement}</option>}
          {MOVES.map((mv) => (
            <option key={mv} value={mv}>
              {mv}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="shotAction">{t("panel.subjectAction")}</label>
        <textarea
          id="shotAction"
          placeholder={t("panel.subjectActionPlaceholder")}
          value={m.action}
          onChange={(e) => set("action", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="shotLighting">{t("panel.lightingMood")}</label>
        <input
          id="shotLighting"
          type="text"
          placeholder={t("panel.lightingPlaceholder")}
          value={m.lighting}
          onChange={(e) => set("lighting", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="shotStyle">{t("panel.visualStyle")}</label>
        <input
          id="shotStyle"
          type="text"
          placeholder={t("panel.stylePlaceholder")}
          value={m.style}
          onChange={(e) => set("style", e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="shotAudio">{t("panel.audioLabel")}</label>
        <textarea
          id="shotAudio"
          placeholder={t("panel.audioPlaceholder")}
          value={m.audio}
          onChange={(e) => set("audio", e.target.value)}
        />
      </div>

      <p className="storage-note">{t("panel.briefNote")}</p>
    </>
  );
}
