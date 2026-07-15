"use client";
// CellViewMenu.tsx — per-slot view dropdown for the reconfigurable quad (Goal B).
// Replaces the .vname chip on the top/left/right cells: a <button> trigger (so the
// cell's onDown `closest("button")` guard blocks drag-start) + a popover to pick a
// fixed ortho preset or a saved custom orbit, and to snapshot the current CAMERA
// orbit as a new custom view. cam + iso cells keep the plain .vname label.

import React, { useEffect, useRef, useState } from "react";
import type { SlotId, OrthoId, ViewKind, SavedView } from "@/lib/editor/engineApi";
import { Check, ChevronDown, Pencil, Plus, X } from "lucide-react";
import { useT } from "@/i18n";
import "./CellViewMenu.css";

const ORTHO_ORDER: OrthoId[] = ["top", "bottom", "left", "right", "front", "back", "iso"];
// Values are i18n keys (translated at render); the OrthoId map is a stable identity.
const ORTHO_LABELS: Record<OrthoId, string> = {
  top: "view.orthoTop",
  bottom: "view.orthoBottom",
  left: "view.orthoLeft",
  right: "view.orthoRight",
  front: "view.orthoFront",
  back: "view.orthoBack",
  iso: "view.orthoIso",
};

function labelOf(kind: ViewKind, savedViews: SavedView[], t: (k: string) => string): string {
  if (typeof kind === "string" && kind.startsWith("custom:")) {
    const v = savedViews.find((s) => "custom:" + s.id === kind);
    return v ? v.name : t("view.viewFallback");
  }
  const key = ORTHO_LABELS[kind as OrthoId];
  return key ? t(key) : String(kind);
}

export function CellViewMenu({
  slot,
  current,
  savedViews,
  onPick,
  onSaveCurrent,
  onRename,
  onDelete,
}: {
  slot: SlotId;
  current: ViewKind;
  savedViews: SavedView[];
  onPick: (kind: ViewKind) => void;
  onSaveCurrent: (name: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Isolate the open popover from the cell's native pointer/wheel handlers so
  // clicking/scrolling the menu never starts a drag or zooms the 3D view.
  useEffect(() => {
    const el = popRef.current;
    if (!el || !open) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("pointerdown", stop);
    el.addEventListener("wheel", stop, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
    };
  }, [open]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setAdding(false);
    setEditId(null);
    setText("");
  }

  function pick(kind: ViewKind) {
    onPick(kind);
    close();
  }

  function commitText() {
    const name = text.trim();
    if (!name) return;
    if (editId && onRename) onRename(editId, name);
    else if (adding) onSaveCurrent(name);
    close();
  }

  return (
    <div className="cell-viewmenu" ref={rootRef}>
      <button
        className="cvm-trigger"
        title={t("view.cellTriggerTitle")}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {labelOf(current, savedViews, t)}
        <span className="cvm-chev"><ChevronDown size={14} aria-hidden /></span>
      </button>

      {open ? (
        <div className="cvm-pop" ref={popRef}>
          <div className="cvm-label">{t("view.standard")}</div>
          {ORTHO_ORDER.map((k) => (
            <button
              key={k}
              className="cvm-item"
              data-active={current === k}
              onClick={() => pick(k)}
            >
              <span className="cvm-name">{t(ORTHO_LABELS[k])}</span>
            </button>
          ))}

          {savedViews.length ? <div className="cvm-label">{t("view.customViews")}</div> : null}
          {savedViews.map((v) =>
            editId === v.id ? (
              <div className="cvm-add" key={v.id}>
                <input
                  autoFocus
                  value={text}
                  placeholder={t("view.viewNamePlaceholder")}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitText();
                  }}
                />
                <button className="cvm-icon" title={t("common.save")} onClick={commitText}>
                  <Check size={16} aria-hidden />
                </button>
              </div>
            ) : (
              <div className="cvm-item" data-active={current === `custom:${v.id}`} key={v.id}>
                <span
                  className="cvm-name"
                  role="button"
                  onClick={() => pick(`custom:${v.id}` as ViewKind)}
                >
                  {v.name}
                </span>
                {onRename ? (
                  <button
                    className="cvm-icon"
                    title={t("common.rename")}
                    onClick={() => {
                      setEditId(v.id);
                      setAdding(false);
                      setText(v.name);
                    }}
                  >
                    <Pencil size={16} aria-hidden />
                  </button>
                ) : null}
                {onDelete ? (
                  <button className="cvm-icon" title={t("view.deleteView")} onClick={() => onDelete(v.id)}>
                    <X size={16} aria-hidden />
                  </button>
                ) : null}
              </div>
            )
          )}

          <div className="cvm-sep" />
          {adding ? (
            <div className="cvm-add">
              <input
                autoFocus
                value={text}
                placeholder={t("view.newViewNamePlaceholder")}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitText();
                }}
              />
              <button className="cvm-icon" title={t("common.save")} onClick={commitText}>
                <Check size={16} aria-hidden />
              </button>
            </div>
          ) : (
            <button
              className="cvm-item"
              onClick={() => {
                setAdding(true);
                setEditId(null);
                setText("");
              }}
            >
              <span className="cvm-name"><Plus size={16} aria-hidden /> {t("view.saveCurrentView")}</span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CellViewMenu;
