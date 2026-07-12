"use client";
// EditorHeaderBar.tsx — the SINGLE consolidated Studio header (on /editor the app
// shell Header suppresses itself, so this is the only bar). One clean row: sidebar
// toggle + compact brand + live stats + project name + autosave + icon actions
// (undo / redo / save) + an "Aksi" dropdown for the less-frequent commands.
// Lives inside .cag-editor (dark studio chrome) AND inside AppStateProvider, so
// it can drive both the editor state (useEditor) and the app shell (useApp).

import React from "react";
import { useEditor } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import { Button } from "@/components/ds/Button";
import { sceneDuration } from "@/lib/editorModel";
import { useProjectSync } from "./useProjectSync";
import { EditorActionMenu } from "./EditorActionMenu";

export function EditorHeaderBar() {
  const ctx = useEditor();
  const app = useApp();
  const { project, canUndo, canRedo, autosaveOn } = ctx;
  // Save routes to localStorage always, and to Convex too when signed in.
  const { saveCurrent } = useProjectSync();

  const sceneCount = project.scenes.length;
  const shotCount = project.scenes.reduce((n, sc) => n + sc.frames.length, 0);
  const totalDur = Math.round(project.scenes.reduce((s, sc) => s + sceneDuration(sc), 0));

  return (
    <header className="e-header">
      <button
        onClick={app.toggleSidebar}
        title="Buka/tutup sidebar"
        style={{
          flex: "none",
          width: 40,
          height: 40,
          border: "var(--border-width) solid var(--line)",
          borderRadius: "var(--radius-md)",
          background: "var(--panel)",
          color: "var(--muted)",
          cursor: "pointer",
          font: "700 14px var(--e-mono)",
          display: "grid",
          placeItems: "center",
        }}
      >
        ☰
      </button>
      <div className="logo">
        <div className="dot" />
        <h1>
          Camera Angle Guide <span style={{ color: "var(--accent)" }}>Pro</span>
        </h1>
      </div>
      <div className="project-meta">
        <span className="status-pill">
          <b>{sceneCount}</b> scene · <b>{shotCount}</b> shot · <b>{totalDur}s</b>
        </span>
      </div>
      <div className="spacer" />
      <div className="scene-bar">
        <input
          type="text"
          placeholder="Nama proyek…"
          maxLength={60}
          value={project.name}
          onChange={(e) => ctx.setProjectName(e.target.value)}
        />
        <span className={"autosave" + (autosaveOn ? " on" : "")} aria-hidden={true}>
          {autosaveOn ? "tersimpan otomatis" : "autosave"}
        </span>
        {/* Undo/Redo icons on desktop; on mobile .hdr-history is hidden and these
            actions live inside the Aksi menu instead (short one-row header). */}
        <span className="hdr-history">
          <Button
            variant="ghost"
            size="sm"
            icon="↶"
            title="Undo (Ctrl/Cmd+Z)"
            disabled={!canUndo}
            onClick={ctx.undo}
            style={{ padding: "7px 11px" }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon="↷"
            title="Redo (Ctrl/Cmd+Shift+Z)"
            disabled={!canRedo}
            onClick={ctx.redo}
            style={{ padding: "7px 11px" }}
          />
        </span>
        <Button
          variant="primary"
          size="sm"
          icon="⤓"
          title="Simpan Proyek"
          onClick={saveCurrent}
          style={{ padding: "7px 11px" }}
        />
        <EditorActionMenu
          onSave={saveCurrent}
          onNew={ctx.newProjectAction}
          onImport={() => app.openImport("paste")}
          onExport={app.exportProject}
          onSchema={app.openSchema}
          onUndo={ctx.undo}
          onRedo={ctx.redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>
    </header>
  );
}

export default EditorHeaderBar;
