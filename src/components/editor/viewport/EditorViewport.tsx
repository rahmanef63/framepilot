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
import { Hud } from "./Hud";
import type { EditorViewportEngine as EngineType } from "./editorViewportEngine";
import type { EngineHudRefs, ViewId } from "./engineApi";

const VIEW_META: { id: ViewId; label: string; maxTitle: string }[] = [
  { id: "cam", label: "◉ CAMERA", maxTitle: "Fokus view (1)" },
  { id: "top", label: "TOP", maxTitle: "Fokus view (2)" },
  { id: "left", label: "LEFT", maxTitle: "Fokus view (3)" },
  { id: "right", label: "RIGHT", maxTitle: "Fokus view (4)" },
  { id: "iso", label: "ISOMETRIC", maxTitle: "Kembali ke Quad (5)" },
];

export function EditorViewport() {
  const ctx = useEditor();
  const { ui, registerEngine, onRigChangedFromEngine, onPlaybackTick, keysHeld, setFocusView } = ctx;

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

          const cells: Partial<Record<ViewId, HTMLElement>> = {};
          (["cam", "top", "left", "right", "iso"] as ViewId[]).forEach((v) => {
            const c = quad.querySelector<HTMLElement>(`.cell[data-view="${v}"]`);
            if (c) cells[v] = c;
          });
          const hud: EngineHudRefs = {
            angleBadges: Array.from(quad.querySelectorAll<HTMLElement>(".angleBadge")),
            shotBadges: Array.from(quad.querySelectorAll<HTMLElement>(".shotBadge")),
            readouts: Array.from(quad.querySelectorAll<HTMLElement>(".readout")),
            formatLabels: Array.from(quad.querySelectorAll<HTMLElement>(".formatLabel")),
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
          registerRef.current(engine);
          engine.startLoop();
        });
      })
      .catch(() => {
        if (quad) {
          const note = document.createElement("div");
          note.style.cssText =
            "position:absolute;inset:0;display:grid;place-items:center;font:600 12px monospace;color:#8d99a5";
          note.textContent = "3D tak tersedia";
          quad.appendChild(note);
        }
      });

    return () => {
      alive = false;
      registerRef.current(null);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
    // mount once — three + engine live for the lifetime of the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFocus = (v: ViewId) => setFocusView(ui.focusView === v ? null : v);

  return (
    <div className="quad-area">
      <div className="quad" ref={quadRef} data-focus={ui.focusView ?? undefined}>
        <canvas
          className="gl"
          ref={canvasRef}
          role="img"
          aria-label="Viewport 3D untuk mengatur kamera, subjek, dan framing"
        />
        {VIEW_META.map((m) => (
          <ViewCell key={m.id} view={m.id} label={m.label} maxTitle={m.maxTitle} onMax={() => toggleFocus(m.id)}>
            {m.id === "cam" ? (
              <>
                <Hud thirdsOn={ui.thirdsOn} />
                <div className="flash" />
              </>
            ) : null}
          </ViewCell>
        ))}
      </div>
    </div>
  );
}

export default EditorViewport;
