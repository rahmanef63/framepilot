"use client";
// EditorHeaderBar.tsx — the editor's own action bar (concept <header>). Project
// name + live stats + undo/redo + save/new + autosave indicator. Lives inside the
// .cag-editor content slot (dark studio chrome), separate from the app Header.

import React from "react";
import { useEditor } from "@/state/EditorState";
import { sceneDuration } from "@/lib/editorModel";

export function EditorHeaderBar() {
  const ctx = useEditor();
  const { project, canUndo, canRedo, autosaveOn } = ctx;

  const sceneCount = project.scenes.length;
  const shotCount = project.scenes.reduce((n, sc) => n + sc.frames.length, 0);
  const totalDur = Math.round(project.scenes.reduce((s, sc) => s + sceneDuration(sc), 0));

  return (
    <header className="e-header">
      <div className="logo">
        <div className="dot" />
        <h1>
          CAMERA ANGLE GUIDE <span style={{ color: "var(--accent)" }}>PRO</span>
        </h1>
        <span>AI previz · storyboard · shot planner</span>
      </div>
      <div className="spacer" />
      <div className="project-meta">
        <span className="status-pill">
          <b>{sceneCount}</b> scene · <b>{shotCount}</b> shot · <b>{totalDur}s</b>
        </span>
        <button
          className="small ghost"
          title="Undo (Ctrl/Cmd+Z)"
          disabled={!canUndo}
          onClick={ctx.undo}
        >
          Undo
        </button>
        <button
          className="small ghost"
          title="Redo (Ctrl/Cmd+Shift+Z)"
          disabled={!canRedo}
          onClick={ctx.redo}
        >
          Redo
        </button>
      </div>
      <div className="scene-bar">
        <span className={"autosave" + (autosaveOn ? " on" : "")}>
          {autosaveOn ? "tersimpan otomatis" : "autosave"}
        </span>
        <input
          type="text"
          placeholder="Nama proyek…"
          maxLength={60}
          value={project.name}
          onChange={(e) => ctx.setProjectName(e.target.value)}
        />
        <button className="primary" onClick={ctx.saveCurrentProject}>
          Simpan Proyek
        </button>
        <button onClick={ctx.newProjectAction}>Proyek Baru</button>
      </div>
    </header>
  );
}

export default EditorHeaderBar;
