// editor/views.ts — reconfigurable quad (Goal B): custom saved orbits + per-slot
// view assignment. SSOT = the project doc (savedViews + quadSlots), so both
// round-trip through save/load/export/autosave. Every mutation re-pushes the
// affected data into the engine's render cache and schedules autosave + history.

import { useCallback } from "react";
import { uid } from "@/lib/dataPrompt";
import { tr } from "@/i18n";
import type { SlotId, ViewKind, SavedView } from "@/lib/editorModel";
import type { EditorCore } from "./core";

export interface ViewActions {
  addSavedView: (name?: string) => void;
  renameSavedView: (id: string, name: string) => void;
  deleteSavedView: (id: string) => void;
  setCellView: (slot: SlotId, kind: ViewKind) => void;
}

const SLOT_DEFAULTS: Record<SlotId, ViewKind> = { top: "top", left: "left", right: "right" };
const SLOTS: SlotId[] = ["top", "left", "right"];

export function useViewActions(
  core: EditorCore,
  deps: { commitHistory: (label?: string) => void }
): ViewActions {
  const { projectRef, engineRef, bump, pushAutosave } = core;
  const { commitHistory } = deps;

  // Re-push both savedViews + slot assignments into the engine (used after any
  // change that can affect slot resolution, e.g. a delete that reverts a slot).
  const syncEngineViews = useCallback(() => {
    const p = projectRef.current;
    engineRef.current?.setSavedViews(p.savedViews ?? []);
    const slots = p.quadSlots ?? { ...SLOT_DEFAULTS };
    SLOTS.forEach((s) => engineRef.current?.setCellView(s, slots[s] ?? SLOT_DEFAULTS[s]));
  }, [projectRef, engineRef]);

  // Snapshot the CURRENT pov camera orbit (engine.getOrbit) as a named view.
  const addSavedView = useCallback(
    (name?: string) => {
      const o = engineRef.current?.getOrbit();
      if (!o) return;
      const p = projectRef.current;
      if (!p.savedViews) p.savedViews = [];
      const view: SavedView = {
        id: uid(),
        name: (name || `View ${p.savedViews.length + 1}`).slice(0, 60),
        az: o.az,
        el: o.el,
        dist: o.dist,
      };
      p.savedViews.push(view);
      engineRef.current?.setSavedViews(p.savedViews);
      pushAutosave();
      commitHistory(tr("state.hist.saveView"));
      bump();
    },
    [projectRef, engineRef, pushAutosave, commitHistory, bump]
  );

  const renameSavedView = useCallback(
    (id: string, name: string) => {
      const p = projectRef.current;
      const v = (p.savedViews ?? []).find((x) => x.id === id);
      if (!v) return;
      v.name = name.slice(0, 60);
      engineRef.current?.setSavedViews(p.savedViews ?? []);
      pushAutosave();
      commitHistory(tr("state.hist.renameView"));
      bump();
    },
    [projectRef, engineRef, pushAutosave, commitHistory, bump]
  );

  const deleteSavedView = useCallback(
    (id: string) => {
      const p = projectRef.current;
      p.savedViews = (p.savedViews ?? []).filter((x) => x.id !== id);
      // revert any slot pointing at the deleted view to its default preset so a
      // cell never goes blank.
      const slots = { ...(p.quadSlots ?? SLOT_DEFAULTS) } as Record<SlotId, ViewKind>;
      SLOTS.forEach((s) => {
        if (slots[s] === (`custom:${id}` as ViewKind)) slots[s] = SLOT_DEFAULTS[s];
      });
      p.quadSlots = slots;
      syncEngineViews();
      pushAutosave();
      commitHistory(tr("state.hist.deleteView"));
      bump();
    },
    [projectRef, syncEngineViews, pushAutosave, commitHistory, bump]
  );

  const setCellView = useCallback(
    (slot: SlotId, kind: ViewKind) => {
      const p = projectRef.current;
      const slots = { ...(p.quadSlots ?? SLOT_DEFAULTS) } as Record<SlotId, ViewKind>;
      slots[slot] = kind;
      p.quadSlots = slots;
      engineRef.current?.setCellView(slot, kind);
      pushAutosave();
      commitHistory(tr("state.hist.changeCellView"));
      bump();
    },
    [projectRef, engineRef, pushAutosave, commitHistory, bump]
  );

  return { addSavedView, renameSavedView, deleteSavedView, setCellView };
}
