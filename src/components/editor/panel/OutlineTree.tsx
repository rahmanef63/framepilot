"use client";
// OutlineTree.tsx — the Outline panel (plan G19). Scene→frame hierarchy mirroring
// the concept renderTree() (~2032-2160): per-scene fold/thumb/inline-rename/meta +
// action row (Play/Prompt/Note/Copy/↑↓/✕) + optional notes textarea + frame rows
// (.frow.current, click=load, inline rename, C/↑↓/✕). Purely presentational over
// useEditor(): every mutation is a frozen context action; the only local state is
// the ephemeral two-click delete-arm affordance (concept armDelete, 2600ms).

import React from "react";
import { useEditor, type EditorContextValue } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import { sceneDuration } from "@/lib/editorModel";
import type { EditorScene } from "@/lib/editorModel";
import { scenePrompt } from "@/lib/editorPrompt";

// concept copyText/fallbackCopy (~2365) — clipboard with a legacy execCommand path.
function copyText(txt: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).catch(() => fallbackCopy(txt));
  } else fallbackCopy(txt);
}
function fallbackCopy(txt: string) {
  const ta = document.createElement("textarea");
  ta.value = txt;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  ta.remove();
}

// mirrors concept mk(txt,title,fn) — a small icon button that never bubbles to the
// scene row / frame row click handler.
function Ico({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      className="ico"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

// mirrors concept armDelete: first click arms (label ✕? + .arm), second click within
// 2600ms confirms, otherwise it disarms itself.
function ArmDelete({ title, onConfirm }: { title: string; onConfirm: () => void }) {
  const [armed, setArmed] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  return (
    <button
      className={"ico danger" + (armed ? " arm" : "")}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        if (armed) {
          if (timer.current) clearTimeout(timer.current);
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 2600);
      }}
    >
      {armed ? "✕?" : "✕"}
    </button>
  );
}

function SceneNode({
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
        <Ico
          title="Play scene ini"
          onClick={() => {
            ctx.setActiveSceneId(sc.id, false);
            ctx.play();
          }}
        >
          Play
        </Ico>
        <Ico
          title="Salin prompt scene"
          onClick={() => {
            copyText(scenePrompt(sc, ctx.project.settings));
            showToast("Prompt scene disalin");
          }}
        >
          Prompt
        </Ico>
        <Ico title="Catatan scene" onClick={() => ctx.toggleSceneNotesOpen(sc.id)}>
          Note
        </Ico>
        <Ico title="Duplikat scene" onClick={() => ctx.dupScene(sc.id)}>
          Copy
        </Ico>
        <Ico title="Naik" onClick={() => ctx.moveScene(sc.id, -1)}>
          ↑
        </Ico>
        <Ico title="Turun" onClick={() => ctx.moveScene(sc.id, 1)}>
          ↓
        </Ico>
        <ArmDelete title="Hapus scene (klik 2×)" onConfirm={() => ctx.delScene(sc.id)} />
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
          <div
            key={f.id}
            className={"frow" + (f.id === currentFrameId ? " current" : "")}
            data-fid={f.id}
            onClick={() => ctx.loadFrame(f.id)}
          >
            <span className="fidx">#{fi + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.thumb || undefined} alt="" />
            <input
              className="fname2"
              value={f.name}
              title="Rename frame"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => ctx.renameFrame(f.id, e.target.value)}
            />
            <span className="facts">
              <Ico title="Duplikat frame" onClick={() => ctx.dupFrame(f.id)}>
                C
              </Ico>
              <Ico title="Naik" onClick={() => ctx.moveFrame(f.id, -1)}>
                ↑
              </Ico>
              <Ico title="Turun" onClick={() => ctx.moveFrame(f.id, 1)}>
                ↓
              </Ico>
              <ArmDelete title="Hapus (klik 2×)" onConfirm={() => ctx.delFrame(f.id)} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OutlineTree() {
  const ctx = useEditor();
  const { showToast } = useApp();
  const { project } = ctx;

  const totalF = project.scenes.reduce((n, s) => n + s.frames.length, 0);
  const totalD = project.scenes.reduce((n, s) => n + sceneDuration(s), 0);

  return (
    <div className="panel-page active">
      <div className="tree-head">
        <button className="primary small" onClick={ctx.addScene}>
          + Scene Baru
        </button>
        <span className="count">
          {project.scenes.length} scene · {totalF} frame · {totalD.toFixed(1)}s
        </span>
        <div className="spacer" />
      </div>
      <div className="tree">
        {project.scenes.map((sc) => (
          <SceneNode
            key={sc.id}
            ctx={ctx}
            showToast={showToast}
            sc={sc}
            active={sc.id === project.activeSceneId}
            currentFrameId={ctx.currentFrameId}
          />
        ))}
      </div>
      <p className="storage-note">
        Klik baris scene untuk mengaktifkannya, klik thumbnail frame untuk memuat kamera. ▶
        memutar scene tsb. Hapus perlu klik ✕ dua kali.
      </p>
    </div>
  );
}

export default OutlineTree;
