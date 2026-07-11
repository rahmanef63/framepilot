"use client";
// OutlineTree.tsx — the Outline panel (plan G19). Scene→frame hierarchy mirroring
// the concept renderTree() (~2032-2160). Composition-only: each scene renders a
// <SceneRow> (see panel/outline/*), every mutation is a frozen context action.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import { sceneDuration } from "@/lib/editorModel";
import { Button } from "@/components/ds/Button";
import { SceneRow } from "./outline/SceneRow";

export function OutlineTree() {
  const ctx = useEditor();
  const { showToast } = useApp();
  const { project } = ctx;

  const totalF = project.scenes.reduce((n, s) => n + s.frames.length, 0);
  const totalD = project.scenes.reduce((n, s) => n + sceneDuration(s), 0);

  return (
    <div className="panel-page active">
      <div className="tree-head">
        <Button variant="primary" size="sm" onClick={ctx.addScene}>
          + Scene Baru
        </Button>
        <span className="count">
          {project.scenes.length} scene · {totalF} frame · {totalD.toFixed(1)}s
        </span>
        <div className="spacer" />
      </div>
      <div className="tree">
        {project.scenes.map((sc) => (
          <SceneRow
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
