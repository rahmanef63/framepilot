"use client";
// ShotPanel.tsx — the Data Shot brief (plan G16). The 6-field brief
// (intent · movement · action · lighting · style · audio) bound to
// useEditor().draftMeta via setDraftMetaField, plus the live #shotSummary
// readout and dirty state from frameIsDirty(currentFrame()). movement is the
// 14-enum MOVES select. duration/transition live on the filmstrip playback
// controls, not this tab. Ported VERBATIM from concept #ptab-shot (~770-816);
// summary line mirrors refreshFrameAction (~1746-1748). Purely presentational.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { CameraPromptDock } from "@/components/editor/CameraPromptDock";
import { MOVES } from "@/lib/dataPrompt";
import { frameDuration } from "@/lib/editorModel";
import { getOrbit, shotLabel, focalLength, subjHeight } from "@/lib/editorMath";

export function ShotPanel() {
  const ctx = useEditor();
  const m = ctx.draftMeta;
  const set = ctx.setDraftMetaField;
  const frame = ctx.currentFrame();
  const dirty = ctx.frameIsDirty(frame);

  // live summary fallbacks read from the current rig (concept shotLabel/focalLength)
  const rig = ctx.rigRef.current;
  const o = getOrbit(rig.camPos, rig.target);

  return (
    <div className="panel-page active">
      {/* ---- output-of-this-tab hero: paste-ready camera prompt ---- */}
      <CameraPromptDock />

      {/* ---- live summary (#shotSummary) ---- */}
      <div className="group">
        <h3>Brief Shot Aktif</h3>
        <div className="shot-summary" id="shotSummary">
          {frame ? (
            <>
              <b>{frame.name}</b> · {frame.shot || shotLabel(o.dist, rig.fov, subjHeight(rig.subj))}{" "}
              · {String(frame.lens || focalLength(rig.fov))}mm ·{" "}
              {frameDuration({ ...frame, meta: m }).toFixed(1)}s
              <br />
              {dirty
                ? "Ada perubahan yang belum diterapkan ke frame."
                : "Semua data frame sudah tersimpan."}
            </>
          ) : (
            "Belum ada frame aktif. Isi brief, atur kamera, lalu tambahkan frame."
          )}
        </div>
      </div>

      {/* ---- 6-field brief ---- */}
      <div className="group">
        <div className="field">
          <label htmlFor="shotIntent">Tujuan shot</label>
          <input
            id="shotIntent"
            type="text"
            placeholder="Contoh: memperkenalkan karakter dan lokasi"
            value={m.intent}
            onChange={(e) => set("intent", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="shotMovement">Gerakan kamera</label>
          <select
            id="shotMovement"
            value={m.movement}
            onChange={(e) => set("movement", e.target.value)}
          >
            {/* keep an imported/custom movement selectable (concept applyShotMetaToUI) */}
            {!MOVES.includes(m.movement) && <option value={m.movement}>{m.movement}</option>}
            {MOVES.map((mv) => (
              <option key={mv} value={mv}>
                {mv}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="shotAction">Aksi subjek</label>
          <textarea
            id="shotAction"
            placeholder="Blocking, ekspresi, arah pandang, atau aksi utama…"
            value={m.action}
            onChange={(e) => set("action", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="shotLighting">Lighting &amp; mood</label>
          <input
            id="shotLighting"
            type="text"
            placeholder="Soft window light, tense, cool blue hour…"
            value={m.lighting}
            onChange={(e) => set("lighting", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="shotStyle">Visual style</label>
          <input
            id="shotStyle"
            type="text"
            placeholder="Commercial clean, documentary, cinematic natural…"
            value={m.style}
            onChange={(e) => set("style", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="shotAudio">Dialog / ambience / SFX</label>
          <textarea
            id="shotAudio"
            placeholder="Dialog penting, room tone, ambience, atau cue SFX…"
            value={m.audio}
            onChange={(e) => set("audio", e.target.value)}
          />
        </div>
      </div>

      <p className="storage-note">
        Data ini ikut tersimpan di frame, Shot List CSV, Storyboard, dan prompt AI. Pilih frame lalu
        klik “Perbarui Frame” untuk menyimpan perubahan.
      </p>
    </div>
  );
}

export default ShotPanel;
