// engineApi.ts — the imperative contract between React (EditorState/UI) and the
// 3D authoring engine. TYPES ONLY: no three, no implementation. Both
// EditorState.tsx and editorViewportEngine.ts import this so the boundary is frozen.

import type { RigState, RigSnapshot } from "@/lib/editorModel";

// ---- shared enums ----
export type ViewId = "cam" | "top" | "left" | "right" | "iso";
export type FocusView = ViewId | null;
export type DragMode = "nav" | "subject" | "camera";
export type MainTab = "editor" | "preview" | "guide";

// ---- HUD text/overlay targets the engine writes into (concept updateHUD) ----
export interface EngineHudRefs {
  angleBadges?: HTMLElement[]; // .angleBadge
  shotBadges?: HTMLElement[]; // .shotBadge
  readouts?: HTMLElement[]; // .readout
  formatLabels?: HTMLElement[]; // .formatLabel
  // per-view cell hosts: letterbox CSS vars (--frame-*), pointer capture, scissor mapping
  cells?: Partial<Record<ViewId, HTMLElement>>;
}

// ---- playback frame data pushed from EditorState into the engine loop ----
export interface EnginePlayback {
  playing: boolean;
  idx: number;
  t: number;
  loop: boolean;
  smooth: boolean;
  frames: RigSnapshot[]; // ordered snapshots for the active scene
  durations: number[]; // per-frame duration (frameDuration), parallel to frames
}

// ---- callbacks the engine invokes from its rAF loop ----
export interface EngineCallbacks {
  onKeyTick?: (dt: number) => void; // per-rAF heartbeat (WASD/arrow handling lives in state)
  onRigChanged?: () => void; // a drag/wheel gesture mutated the rig (mark dirty / schedule history)
  onPlaybackTick?: (idx: number, t: number, done: boolean) => void; // playback advanced
}

export interface EngineMountOpts {
  hud?: EngineHudRefs;
  callbacks?: EngineCallbacks;
  keysHeld?: Set<string>; // shared held-key set the loop reads for fly navigation
  aspect?: string; // initial output aspect ("16:9")
}

// ============================================================
// The engine handle — everything EditorState / UI needs from the 3D layer.
// ============================================================
export interface EditorEngineHandle {
  // --- lifecycle ---
  mount(canvas: HTMLCanvasElement, opts?: EngineMountOpts): void;
  dispose(): void;
  resize(): void;
  startLoop(): void;
  stopLoop(): void;

  // --- rig (imperative; no React re-render per tick) ---
  setRig(partial: Partial<RigState>): void;
  getRig(): RigState;
  getOrbit(): { az: number; el: number; dist: number };
  setOrbit(az: number, el: number, dist: number): void;
  snapState(): RigSnapshot;
  applyState(snap: RigSnapshot): boolean;
  setSubject(subj: "person" | "object"): void;

  // --- view / overlay state ---
  applyFocus(view: FocusView): void;
  setActiveTab(tab: MainTab): void; // gates which scissor rects the loop draws
  setDragMode(mode: DragMode): void;
  setThirds(on: boolean): void;
  setFrustum(on: boolean): void;
  setAspect(aspect: string): void; // real POV aspect + letterbox

  // --- HUD ---
  setHudRefs(refs: EngineHudRefs): void;
  updateHud(): void;

  // --- thumbnails (offscreen renderer, jpeg dataURL sized to aspect) ---
  captureThumb(aspect?: string): string;

  // --- playback (driven by the engine rAF loop) ---
  setPlayback(pb: Partial<EnginePlayback>): void;
  stepReset(): void;
}
