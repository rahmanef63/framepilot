"use client";
import React from "react";
import type { EditorContextValue } from "@/state/EditorState";
import type { EditorScene } from "@/lib/editorModel";
import { sceneDuration } from "@/lib/editorModel";
import { scenePrompt } from "@/lib/editorPrompt";
import { usePlatform } from "@/components/editor/usePlatform";
import { IcoButton, ArmDeleteButton } from "./IcoButton";
import { FrameRow } from "./FrameRow";
import { copyText } from "./clipboard";

// One scene node: fold/thumb/inline-rename/meta head + action row (Play/Prompt/Note/
// Copy/↑↓/✕) + optional notes textarea + frame rows. Purely presentational over ctx.
export function SceneRow({
  ctx,
  showToast,
  sc,
  active,
  currentFrameId,
}: {
  ctx: EditorContextValue;
  showToast: (m: string) => void;
  sc: EditorScene;
  active: boolean;
  currentFrameId: string | null;
}) {
  const [platform] = usePlatform();
  const cls =
    "snode" + (active ? " activeScene" : "") + (sc.collapsed ? " collapsed" : "");
  const head = sc.frames[0];
  return (
    <div className={cls}>
      {/* baris judul scene */}
      <div className="srow" onClick={() => ctx.setActiveSceneId(sc.id, true)}>
        <button
          className="fold ico"
          title="Buka/tutup"
          onClick={(e) => {
            e.stopPropagation();
            ctx.toggleSceneCollapsed(sc.id);
          }}
        >
          {sc.collapsed ? "▸" : "▾"}
        </button>
        {head && head.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="sthumb" src={head.thumb} alt="" />
        ) : (
          <div className="sthumb ph">SC</div>
        )}
        <input
          className="sname"
          value={sc.name}
          title="Rename scene"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => ctx.renameScene(sc.id, e.target.value)}
        />
        <span className="smeta">
          {sc.frames.length}f · {sceneDuration(sc).toFixed(1)}s
        </span>
      </div>

      {/* baris aksi scene */}
      <div className="sacts">
        <IcoButton
          title="Play scene ini"
          onClick={() => {
            ctx.setActiveSceneId(sc.id, false);
            ctx.play();
          }}
        >
          Play
        </IcoButton>
        <IcoButton
          title="Salin prompt kamera scene"
          onClick={() => {
            copyText(scenePrompt(sc, ctx.project.settings, platform));
            showToast("Prompt kamera scene disalin");
          }}
        >
          Prompt
        </IcoButton>
        <IcoButton title="Catatan scene" onClick={() => ctx.toggleSceneNotesOpen(sc.id)}>
          Note
        </IcoButton>
        <IcoButton title="Duplikat scene" onClick={() => ctx.dupScene(sc.id)}>
          Copy
        </IcoButton>
        <IcoButton title="Naik" onClick={() => ctx.moveScene(sc.id, -1)}>
          ↑
        </IcoButton>
        <IcoButton title="Turun" onClick={() => ctx.moveScene(sc.id, 1)}>
          ↓
        </IcoButton>
        <ArmDeleteButton title="Hapus scene (klik 2×)" onConfirm={() => ctx.delScene(sc.id)} />
      </div>

      {/* catatan scene */}
      {sc.notesOpen || sc.notes ? (
        <textarea
          className="snotes"
          placeholder="Catatan scene… (lokasi, mood, waktu, kontinuitas)"
          value={sc.notes}
          onChange={(e) => ctx.setSceneNotes(sc.id, e.target.value)}
        />
      ) : null}

      {/* anak: frames */}
      <div className="fchildren">
        {!sc.frames.length ? (
          <div className="empty-tree">
            Belum ada frame — aktifkan scene ini lalu + Tambah Frame.
          </div>
        ) : null}
        {sc.frames.map((f, fi) => (
          <FrameRow
            key={f.id}
            ctx={ctx}
            frame={f}
            index={fi}
            current={f.id === currentFrameId}
          />
        ))}
      </div>
    </div>
  );
}
