"use client";
// ViewportCameraMenu.tsx — the ONE camera-control chip on the CAM viewport cell.
// Replaces the single-purpose brand picker (CamPresetMenu) with an accordion popover
// that groups every per-shot camera control reachable straight from the preview:
//   Rasio · Sudut kamera (angle) · Posisi tersimpan · Ukuran shot · Preset kamera.
// One row open at a time; each expands its own option list ("sub-menu"). Reuses
// CellViewMenu.css (.cell-viewmenu/.cvm-*) + the appended .cvm-acc-* accordion rules,
// with the same pointer/wheel isolation so interacting never drags/zooms the canvas.

import React, { useEffect, useRef, useState } from "react";
import { useEditor } from "@/state/EditorState";
import { ARS } from "@/lib/dataPrompt";
import { CAMERAS, cameraById } from "@/lib/cameras";
import { ANGLE_PRESETS, SHOT_PRESETS } from "@/lib/editor/presets";
import { Aperture, ChevronDown, Plus } from "lucide-react";
import "./CellViewMenu.css";

type SectionId = "ratio" | "angle" | "saved" | "shot" | "camera";

export function ViewportCameraMenu() {
  const ctx = useEditor();
  const settings = ctx.project.settings;
  const current = ctx.currentFrame();
  const global = settings.globalCamera;
  const camValue = global ? settings.camera : current?.camera ?? "";
  const camLabel = camValue ? cameraById(camValue)?.label ?? "Kamera" : "Tanpa kamera";
  const savedViews = ctx.project.savedViews ?? [];

  const [open, setOpen] = useState(false);
  const [sec, setSec] = useState<SectionId | null>(null);
  const [saveName, setSaveName] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Isolate the open popover from the cell's native pointer/wheel handlers so
  // clicking/scrolling the menu never starts a canvas drag or zooms the 3D view.
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
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleSec = (id: SectionId) => setSec((s) => (s === id ? null : id));

  const pickCamera = (id: string) => {
    if (global) ctx.setProjectCamera(id);
    else if (current) ctx.setFrameCamera(current.id, id);
  };

  const restoreView = (az: number, el: number, dist: number) => {
    ctx.orbit(az, el, dist); // absolute orbit → camera jumps to the saved position
    setOpen(false);
  };

  const saveCurrent = () => {
    ctx.addSavedView(saveName.trim() || undefined);
    setSaveName("");
  };

  return (
    <div className="cell-viewmenu" ref={rootRef}>
      <button
        className="cvm-trigger"
        title="Kamera & frame — rasio, sudut, posisi, ukuran, preset"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="cvm-camera-pop"
        onClick={() => setOpen((o) => !o)}
      >
        <Aperture size={16} aria-hidden /> Kamera
        <span className="cvm-chev"><ChevronDown size={14} aria-hidden /></span>
      </button>

      {open ? (
        <div className="cvm-pop cvm-acc" id="cvm-camera-pop" role="menu" ref={popRef}>
          {/* RASIO — aspect ratio (persistent) */}
          <AccRow id="ratio" label="Rasio" value={settings.aspectRatio} open={sec === "ratio"} onToggle={toggleSec} />
          {sec === "ratio" ? (
            <div className="cvm-sub" id="cvm-sub-ratio" role="group" aria-label="Rasio">
              {ARS.map((a) => (
                <button key={a} className="cvm-item" data-active={settings.aspectRatio === a} onClick={() => ctx.setAspect(a)}>
                  <span className="cvm-name">{a}</span>
                </button>
              ))}
            </div>
          ) : null}

          {/* SUDUT KAMERA — angle presets (momentary) */}
          <AccRow id="angle" label="Sudut kamera" value="preset" open={sec === "angle"} onToggle={toggleSec} />
          {sec === "angle" ? (
            <div className="cvm-sub cvm-grid" id="cvm-sub-angle" role="group" aria-label="Sudut kamera">
              {ANGLE_PRESETS.map((p) => (
                <button key={p.label} className="cvm-chip" title={`el ${p.el}° · roll ${p.roll}°`} onClick={() => ctx.applyAnglePreset(p.el, p.roll)}>
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}

          {/* POSISI TERSIMPAN — saved camera orbits (restore / snapshot) */}
          <AccRow id="saved" label="Posisi tersimpan" value={String(savedViews.length)} open={sec === "saved"} onToggle={toggleSec} />
          {sec === "saved" ? (
            <div className="cvm-sub" id="cvm-sub-saved" role="group" aria-label="Posisi tersimpan">
              {savedViews.length === 0 ? <div className="cvm-empty">Belum ada posisi tersimpan.</div> : null}
              {savedViews.map((v) => (
                <button key={v.id} className="cvm-item" title="Pulihkan kamera ke posisi ini" onClick={() => restoreView(v.az, v.el, v.dist)}>
                  <span className="cvm-name">{v.name}</span>
                  <span className="cvm-tag">pulihkan</span>
                </button>
              ))}
              <div className="cvm-add">
                <input
                  value={saveName}
                  placeholder="Simpan posisi kamera…"
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveCurrent()}
                />
                <button className="cvm-icon" aria-label="Simpan posisi kamera saat ini" title="Simpan posisi kamera saat ini" onClick={saveCurrent}>
                  <Plus size={16} aria-hidden />
                </button>
              </div>
            </div>
          ) : null}

          {/* UKURAN SHOT — shot-size presets (momentary) */}
          <AccRow id="shot" label="Ukuran shot" value="preset" open={sec === "shot"} onToggle={toggleSec} />
          {sec === "shot" ? (
            <div className="cvm-sub cvm-grid" id="cvm-sub-shot" role="group" aria-label="Ukuran shot">
              {SHOT_PRESETS.map((p) => (
                <button key={p.label} className="cvm-chip" onClick={() => ctx.applyShotPreset(p.r)}>
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}

          {/* PRESET KAMERA — brand look tag (persistent; per-frame or global) */}
          <AccRow id="camera" label={global ? "Preset kamera · global" : "Preset kamera"} value={camLabel} open={sec === "camera"} onToggle={toggleSec} />
          {sec === "camera" ? (
            <div className="cvm-sub" id="cvm-sub-camera" role="group" aria-label="Preset kamera">
              {/* global toggle in-place so the section works even before any frame
                  exists (one camera for all frames), mirroring GlobalCameraSettings. */}
              <button className="cvm-item" data-active={global} onClick={() => ctx.setGlobalCamera(!global)}>
                <span className="cvm-name">Kamera global</span>
                <span className="cvm-state">{global ? "ON" : "OFF"}</span>
              </button>
              {!global && !current ? (
                <div className="cvm-empty">Pilih / buat frame, atau nyalakan kamera global.</div>
              ) : null}
              {CAMERAS.map((c) => (
                <button
                  key={c.id}
                  className="cvm-item"
                  data-active={camValue === c.id}
                  disabled={!global && !current}
                  onClick={() => pickCamera(c.id)}
                >
                  <span className="cvm-name">{c.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AccRow({
  id,
  label,
  value,
  open,
  onToggle,
}: {
  id: SectionId;
  label: string;
  value: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
}) {
  return (
    <button
      className={"cvm-acc-row" + (open ? " open" : "")}
      aria-expanded={open}
      aria-controls={`cvm-sub-${id}`}
      onClick={() => onToggle(id)}
    >
      <span className="cvm-acc-label">{label}</span>
      {value ? <span className="cvm-acc-val">{value}</span> : null}
      <span className="cvm-acc-chev" aria-hidden><ChevronDown size={14} /></span>
    </button>
  );
}

export default ViewportCameraMenu;
