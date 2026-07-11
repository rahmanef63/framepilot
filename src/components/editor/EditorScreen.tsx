"use client";
// EditorScreen.tsx — the CAG editor shell (concept body). One persistent
// <EditorViewport/> mounted inside the always-rendered editor page; tab switching
// only toggles the .active/display of the two .page containers (Editor + Full
// Preview) so React never unmounts the viewport and the three engine keeps its
// rAF loop / WebGL context alive across tabs. The camera-grammar cookbook lives
// at /panduan (Shell sidebar → "Panduan"); the old in-editor Guide tab was folded
// into it (Ship B slim).

import React from "react";
import "./editor.css";
import { useEditor } from "@/state/EditorState";
import { EditorHeaderBar } from "./EditorHeaderBar";
import { EditorTabBar } from "./EditorTabBar";
import { PanelTabs } from "./panel/PanelTabs";
import { EditorViewport } from "./viewport/EditorViewport";
import { Hud } from "./viewport/Hud";
import { FramesSection } from "./FramesSection";
import { CameraPromptDock } from "./CameraPromptDock";
import { PreviewPanel } from "./PreviewPanel";

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
        <FramesSection />
        <CameraPromptDock />
      </div>

      {/* ---- Full Preview page: the ONE canvas reflows into .pv-viewport ---- */}
      <div className={"page preview-page" + (tab === "preview" ? " active" : "")}>
        <div className="pv-stage">
          <div className="pv-viewport" data-view="cam">
            <Hud thirdsOn={ui.thirdsOn} />
          </div>
        </div>
        <PreviewPanel />
      </div>
    </div>
  );
}

export default EditorScreen;
