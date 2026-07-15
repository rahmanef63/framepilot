"use client";
// OutlineTree.tsx — the Outline scene→frame tree (plan G19), mirroring the concept
// renderTree() (~2032-2160). Composition-only: each scene renders a <SceneRow>
// (see panel/outline/*), every mutation is a frozen context action. Embeddable:
// returns a bare fragment (no .panel-page wrapper) so ShotPanel hosts it inline.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import { useT } from "@/i18n";
import { sceneDuration } from "@/lib/editorModel";
import { SceneRow } from "./outline/SceneRow";

export function OutlineTree() {
  const ctx = useEditor();
  const { showToast } = useApp();
  const { t } = useT();
  const { project } = ctx;

  const totalF = project.scenes.reduce((n, s) => n + s.frames.length, 0);
  const totalD = project.scenes.reduce((n, s) => n + sceneDuration(s), 0);

  return (
    <>
      {/* "+ Scene" lives in the sticky header above (co-located with "+ Frame"); this
          is just the count for the list below. */}
      <div className="tree-head">
        <span className="count">
          {t("panel.treeCount", { sc: project.scenes.length, fr: totalF, d: totalD.toFixed(1) })}
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
      <p className="storage-note">{t("panel.treeHint")}</p>
    </>
  );
}
