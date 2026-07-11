"use client";
// EditorScreen.tsx — the CAG editor shell (concept body). One persistent
// <EditorViewport/> mounted inside the always-rendered editor page; tab switching
// only toggles the .active/display of the three .page containers (plan §7.3.1) so
// React never unmounts the viewport and the three engine keeps its rAF loop /
// WebGL context alive across tabs. Preview + Guide are placeholders for this stage
// (Workflow B reflows the shared canvas into the preview stage + builds the guide).

import React from "react";
import "./editor.css";
import { useEditor } from "@/state/EditorState";
import { EditorHeaderBar } from "./EditorHeaderBar";
import { EditorTabBar } from "./EditorTabBar";
import { PanelTabs } from "./panel/PanelTabs";
import { EditorViewport } from "./viewport/EditorViewport";

export function EditorScreen() {
  const ctx = useEditor();
  const { ui, playback } = ctx;
  const tab = ui.mainTab;

  return (
    <div className={"cag-editor" + (playback.playing ? " playing" : "")} data-tab={tab}>
      <EditorHeaderBar />
      <EditorTabBar />

      {/* ---- Editor page (holds the ONE viewport; never unmounts) ---- */}
      <div className={"page editor-page" + (tab === "editor" ? " active" : "")}>
        <EditorViewport />
        <div className="panel">
          <PanelTabs />
        </div>
        <div className="frames-section">
          <div className="storage-note" style={{ padding: "10px 4px" }}>
            Filmstrip &amp; transport menyusul (Workflow B).
          </div>
        </div>
      </div>

      {/* ---- Full Preview page (placeholder) ---- */}
      <div className={"page preview-page" + (tab === "preview" ? " active" : "")}>
        <div className="pv-stage" style={{ display: "grid", placeItems: "center" }}>
          <div className="storage-note">Full Preview menyusul (Workflow B).</div>
        </div>
      </div>

      {/* ---- Guide Belajar page (placeholder) ---- */}
      <div className={"page guide-page" + (tab === "guide" ? " active" : "")}>
        <div className="storage-note" style={{ padding: 24 }}>
          Guide Belajar menyusul (Workflow B).
        </div>
      </div>
    </div>
  );
}

export default EditorScreen;
