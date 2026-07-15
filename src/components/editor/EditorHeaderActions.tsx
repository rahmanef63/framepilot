"use client";
// EditorHeaderActions.tsx — the Studio's project CRUD (name / save / undo / redo /
// tour / Aksi menu). It renders inside EditorStateProvider (so useEditor works) but
// PORTALS into the app Shell header's right slot (#fp-header-actions), so the app
// header owns one unified bar: nav in the center, the active route's CRUD on the
// right. Styled with app tokens (light shell chrome) — no .cag-editor scope needed.

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import { useT } from "@/i18n";
import { Button } from "@/components/ds/Button";
import { useProjectSync } from "./useProjectSync";
import { EditorActionMenu, EditorActionRows } from "./EditorActionMenu";
import { Undo2, Redo2, GraduationCap, Download } from "lucide-react";

export function EditorHeaderActions() {
  const ctx = useEditor();
  const app = useApp();
  const { t } = useT();
  const { project, canUndo, canRedo, autosaveOn } = ctx;
  const { saveCurrent } = useProjectSync();

  const [slot, setSlot] = useState<HTMLElement | null>(null);
  // On the mobile editor the app header is hidden and the ⋯ actions live in the ☰
  // drawer instead — portal the shared action rows into the sidebar's slot.
  const [drawerSlot, setDrawerSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(document.getElementById("fp-header-actions"));
    setDrawerSlot(document.getElementById("fp-drawer-actions"));
  }, []);
  const startTour = () => window.dispatchEvent(new Event("cag:start-tour"));

  const content = (
    <div className="ehx">
      <input
        className="ehx-name"
        type="text"
        placeholder={t("editor.projectNamePlaceholder")}
        maxLength={60}
        value={project.name}
        onChange={(e) => ctx.setProjectName(e.target.value)}
        aria-label={t("editor.projectNameAria")}
      />
      <span className={"ehx-autosave" + (autosaveOn ? " on" : "")} aria-hidden>
        {autosaveOn ? t("editor.saved") : t("editor.autosave")}
      </span>
      {/* undo/redo visible on desktop; folded into the Aksi (⋯) menu on mobile */}
      <span className="ehx-history">
        <Button variant="ghost" size="sm" icon={<Undo2 size={16} aria-hidden />} title={t("editor.actionUndoDesc")} disabled={!canUndo} onClick={ctx.undo} style={{ padding: "7px 10px" }} />
        <Button variant="ghost" size="sm" icon={<Redo2 size={16} aria-hidden />} title={t("editor.actionRedoDesc")} disabled={!canRedo} onClick={ctx.redo} style={{ padding: "7px 10px" }} />
      </span>
      {/* .ehx-tour is display:contents (globals.css) so desktop lays it out inline as
          before; the mobile ≤820 rule flips it to display:none (folded into ⋯). The
          contents value MUST live in CSS, not inline — an inline style would outrank
          the media-query display:none and the button would never hide. */}
      <span className="ehx-tour">
        <Button
          variant="ghost"
          size="sm"
          icon={<GraduationCap size={16} aria-hidden />}
          title={t("editor.tourTitle")}
          onClick={() => window.dispatchEvent(new Event("cag:start-tour"))}
          style={{ padding: "7px 10px" }}
        />
      </span>
      {/* .ehx-save (display:contents, globals.css) → mobile ≤820 hides it; Simpan is
          still reachable in the ⋯ menu. Header on phones = undo · redo · ⋯. */}
      <span className="ehx-save">
        <Button variant="primary" size="sm" icon={<Download size={16} aria-hidden />} title={t("editor.actionSaveProject")} onClick={saveCurrent} style={{ padding: "7px 11px" }}>
          {t("common.save")}
        </Button>
      </span>
      <EditorActionMenu
        onSave={saveCurrent}
        onNew={ctx.newProjectAction}
        onImport={() => app.openImport("paste")}
        onExport={app.exportProject}
        onSchema={app.openSchema}
        onUndo={ctx.undo}
        onRedo={ctx.redo}
        onTour={() => window.dispatchEvent(new Event("cag:start-tour"))}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </div>
  );

  const drawerActions = (
    <EditorActionRows
      onSave={saveCurrent}
      onNew={ctx.newProjectAction}
      onImport={() => app.openImport("paste")}
      onExport={app.exportProject}
      onSchema={app.openSchema}
      onUndo={ctx.undo}
      onRedo={ctx.redo}
      onTour={startTour}
      canUndo={canUndo}
      canRedo={canRedo}
    />
  );

  return (
    <>
      {slot ? createPortal(content, slot) : null}
      {drawerSlot ? createPortal(drawerActions, drawerSlot) : null}
    </>
  );
}
