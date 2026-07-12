"use client";
// EditorViewport.tsx — the ONE persistent 3D viewport. Mounts a single WebGL
// canvas, dynamically imports three@0.161 (kept out of the shared bundle),
// constructs the EditorViewportEngine, wires HUD refs + callbacks from
// EditorState, starts the rAF loop, and disposes on unmount. The five ViewCell
// overlays + the cam Hud sit transparently on top of the one canvas; the engine
// maps each cell's rect to a scissor viewport (concept single-canvas model).

import React, { useEffect, useRef } from "react";
import { useEditor } from "@/state/EditorState";
import { ViewCell } from "./ViewCell";
import { CellViewMenu } from "./CellViewMenu";
import { Hud } from "./Hud";
import type { EditorViewportEngine as EngineType } from "./editorViewportEngine";
import type { EngineHudRefs, ViewId, SlotId, ViewKind } from "./engineApi";

// The three reconfigurable quad slots (cam stays locked to the pov shot camera).
const SLOT_IDS: SlotId[] = ["top", "left", "right"];
const SLOT_DEFAULTS: Record<SlotId, ViewKind> = { top: "top", left: "left", right: "right" };

const VIEW_META: { id: ViewId; label: string; maxTitle: string }[] = [
  { id: "cam", label: "◉ CAMERA", maxTitle: "Fokus view (1)" },
  { id: "top", label: "TOP", maxTitle: "Fokus view (2)" },
  { id: "left", label: "LEFT", maxTitle: "Fokus view (3)" },
  { id: "right", label: "RIGHT", maxTitle: "Fokus view (4)" },
  { id: "iso", label: "ISOMETRIC", maxTitle: "Kembali ke Quad (5)" },
];

export function EditorViewport() {
  const ctx = useEditor();
  const {
    ui,
    project,
    registerEngine,
    onRigChangedFromEngine,
    onPlaybackTick,
    keysHeld,
    setFocusView,
    setCellView,
    addSavedView,
    renameSavedView,
    deleteSavedView,
  } = ctx;
  const savedViews = project.savedViews ?? [];
  const quadSlots = project.quadSlots ?? SLOT_DEFAULTS;

  const quadRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<EngineType | null>(null);

  // stable callback holders so the mount effect can stay []-deps
  const rigChangedRef = useRef(onRigChangedFromEngine);
  const playbackTickRef = useRef(onPlaybackTick);
  const registerRef = useRef(registerEngine);
  rigChangedRef.current = onRigChangedFromEngine;
  playbackTickRef.current = onPlaybackTick;
  registerRef.current = registerEngine;

  useEffect(() => {
    let alive = true;
    const canvas = canvasRef.current;
    const quad = quadRef.current;
    if (!canvas || !quad) return;

    import("three")
      .then((THREE) => {
        if (!alive) return;
        return import("./editorViewportEngine").then(({ EditorViewportEngine }) => {
          if (!alive) return;
          const engine = new EditorViewportEngine(THREE);
          engineRef.current = engine;

          // Scope HUD text targets to the whole editor root so the Full-Preview
          // stage's badges/readout also update; the scissor cells stay the quad's.
          const root = (quad.closest(".cag-editor") as HTMLElement | null) ?? quad;
          const cells: Partial<Record<ViewId, HTMLElement>> = {};
          (["cam", "top", "left", "right", "iso"] as ViewId[]).forEach((v) => {
            const c = quad.querySelector<HTMLElement>(`.cell[data-view="${v}"]`);
            if (c) cells[v] = c;
          });
          const hud: EngineHudRefs = {
            angleBadges: Array.from(root.querySelectorAll<HTMLElement>(".angleBadge")),
            shotBadges: Array.from(root.querySelectorAll<HTMLElement>(".shotBadge")),
            readouts: Array.from(root.querySelectorAll<HTMLElement>(".readout")),
            formatLabels: Array.from(root.querySelectorAll<HTMLElement>(".formatLabel")),
            cells,
          };

          engine.mount(canvas, {
            hud,
            callbacks: {
              onRigChanged: () => rigChangedRef.current(),
              onPlaybackTick: (idx, t, done) => playbackTickRef.current(idx, t, done),
            },
            keysHeld,
            aspect: ctx.project.settings.aspectRatio,
          });
          // Full-Preview stage = a second "cam" pointer/wheel surface (concept ~1506).
          const pv = root.querySelector<HTMLElement>(".pv-viewport");
          if (pv) engine.attachSurface(pv, "cam");
          registerRef.current(engine);
          engine.startLoop();
        });
      })
      .catch(() => {
        if (quad) {
          const note = document.createElement("div");
          note.style.cssText =
            "position:absolute;inset:0;display:grid;place-items:center;font:600 12px var(--e-mono);color:var(--muted-foreground)";
          note.textContent = "3D tak tersedia";
          quad.appendChild(note);
        }
      });

    return () => {
      alive = false;
      registerRef.current(null);
      // Return the canvas to its React-owned parent so unmount removal is clean.
      if (canvas && quad && canvas.parentElement !== quad) quad.appendChild(canvas);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
    // mount once — three + engine live for the lifetime of the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflow the ONE canvas into the Full-Preview stage on the preview tab, back to
  // the quad otherwise (concept switchTab moves the canvas node; setActiveTab in
  // the engine resets lastW so ensureSize re-measures the new parent).
  useEffect(() => {
    const canvas = canvasRef.current;
    const quad = quadRef.current;
    if (!canvas || !quad) return;
    if (ui.mainTab === "preview") {
      const pv = (quad.closest(".cag-editor") as HTMLElement | null)?.querySelector<HTMLElement>(
        ".pv-viewport"
      );
      if (pv && canvas.parentElement !== pv) pv.insertBefore(canvas, pv.firstChild);
    } else if (canvas.parentElement !== quad) {
      quad.insertBefore(canvas, quad.firstChild);
    }
  }, [ui.mainTab]);

  const toggleFocus = (v: ViewId) => setFocusView(ui.focusView === v ? null : v);

  return (
    <div className="quad-area" data-tour="viewport">
      <div className="quad" ref={quadRef} data-focus={ui.focusView ?? undefined}>
        <canvas
          className="gl"
          ref={canvasRef}
          role="img"
          aria-label="Viewport 3D untuk mengatur kamera, subjek, dan framing"
        />
        {VIEW_META.map((m) => {
          const isSlot = (SLOT_IDS as string[]).includes(m.id);
          const slot = m.id as SlotId;
          return (
            <ViewCell
              key={m.id}
              view={m.id}
              label={m.label}
              maxTitle={m.maxTitle}
              onMax={() => toggleFocus(m.id)}
              head={
                isSlot ? (
                  <CellViewMenu
                    slot={slot}
                    current={quadSlots[slot] ?? SLOT_DEFAULTS[slot]}
                    savedViews={savedViews}
                    onPick={(kind) => setCellView(slot, kind)}
                    onSaveCurrent={(name) => addSavedView(name)}
                    onRename={renameSavedView}
                    onDelete={deleteSavedView}
                  />
                ) : undefined
              }
            >
              {m.id === "cam" ? (
                <>
                  <Hud thirdsOn={ui.thirdsOn} />
                  <div className="flash" />
                </>
              ) : null}
            </ViewCell>
          );
        })}
      </div>
    </div>
  );
}

export default EditorViewport;
