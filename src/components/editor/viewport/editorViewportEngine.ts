// TODO(rr): cohesive vendored-style Three.js controller — LOC cap waived (treated like components/ui/* vendored exclusion); a split would scatter shared this-state across files and harm readability.
// editorViewportEngine.ts — the 3D authoring engine for the CAG Editor.
// A plain TS class implementing EditorEngineHandle (engineApi.ts). Ports the
// concept's single-canvas scissor-multi-viewport model (concept ~1094-1530,
// 2226-2760) onto three@0.161 via a dynamic import typed as `any` (like
// CagViewport). All constants / sensitivities / clamps / thresholds are
// load-bearing and ported VERBATIM — do NOT tweak.
//
// Three r128 -> 0.161 API deltas (plan §7.2):
//   outputEncoding=sRGBEncoding  ->  outputColorSpace=SRGBColorSpace
//   camera.getWorldDirection()    ->  getWorldDirection(new Vector3())
//   matrixColumn(m,i)             ->  new Vector3().setFromMatrixColumn(cam.matrixWorld, i)

import {
  deg2rad,
  clamp,
  norm360,
  norm180,
  smoothstep,
  getOrbit as orbitFromCart,
  setOrbit as cartFromOrbit,
  focalLength,
  angleLabel,
  shotLabel,
  subjHeight,
  aspectNumber,
} from "@/lib/editorMath";
import { tr } from "@/i18n";
import {
  buildPerson,
  buildObject,
  buildCameraGizmo,
  buildFacingCone,
  buildTargetDot,
  sampleToken,
} from "@/shared/viewport3d/scene-kit";
import type { RigState, RigSnapshot, Vec3 } from "@/lib/editorModel";
import type {
  EditorEngineHandle,
  EngineMountOpts,
  EngineHudRefs,
  EngineCallbacks,
  EnginePlayback,
  ViewId,
  FocusView,
  DragMode,
  MainTab,
  SlotId,
  OrthoId,
  ViewKind,
  SavedView,
} from "@/lib/editor/engineApi";

/* eslint-disable @typescript-eslint/no-explicit-any */
type THREE = any;

interface OrthoView {
  cam: any;
  ext: number;
  u: number;
  v: number;
  w: number;
}

// Scene colors are LIGHT + theme-token-driven, sampled at build() off the mounted
// canvas (mirrors CagViewport._rgb). No hardcoded dark palette — the scene follows
// the app's [data-theme] via the semantic tokens (--card / --background / --secondary /
// --border / --muted-foreground / --foreground / --primary). Fallbacks below are LIGHT.

function defaultRig(): RigState {
  // az30/el4/dist3, fov40, roll0, targetY1.35, person (matches editorModel).
  const target: Vec3 = { x: 0, y: 1.35, z: 0 };
  const p = cartFromOrbit(30, 4, 3, target);
  return {
    camPos: { x: p.x, y: p.y, z: p.z },
    target,
    fov: 40,
    roll: 0,
    subj: "person",
    subjRot: 0,
    subjPos: { x: 0, z: 0 },
    trackSubject: false,
  };
}

export class EditorViewportEngine implements EditorEngineHandle {
  private T: THREE;

  // --- live rig (shared by-reference with EditorState.rigRef after setRig) ---
  private rig: RigState = defaultRig();

  // --- three objects ---
  private canvas: HTMLCanvasElement | null = null;
  private renderer: any = null;
  private thumbRenderer: any = null;
  private scene: any = null;
  private povFog: any = null;
  private povBg: any = null;
  private orthoBg: any = null;
  private clearColor: any = null;
  private subjMat: any = null;
  private povCam: any = null;
  private camHelper: any = null;
  private camBody: any = null;
  private targetDot: any = null;
  private person: any = null;
  private objectSubj: any = null;
  private facingGroup: any = null;
  private views: Record<OrthoId, OrthoView> | null = null;

  // --- reconfigurable quad (Goal B) — slot→view map (default = identity, so
  // byte-identical default behavior), the persisted custom orbits, and ONE reused
  // perspective camera for whichever custom view a slot draws. ---
  private slotView: Record<SlotId, ViewKind> = { top: "top", left: "left", right: "right" };
  private savedViews: SavedView[] = [];
  private customCam: any = null;

  // --- view / overlay state ---
  private activeTab: MainTab = "editor";
  private focusView: FocusView = null;
  private dragMode: DragMode = "nav";
  private frustumOn = true;
  private aspect = "16:9";
  private fps = 24;

  // --- HUD refs ---
  private hud: EngineHudRefs = {};

  // --- callbacks / input ---
  private callbacks: EngineCallbacks = {};
  private keysHeld: Set<string> = new Set();
  private keyboardMoved = false;

  // --- loop / sizing ---
  private clock: any = null;
  private rafId: number | null = null;
  private running = false;
  private lastW = -1;
  private lastH = -1;

  // --- playback ---
  private pb: EnginePlayback = {
    playing: false,
    idx: 0,
    t: 0,
    loop: false,
    smooth: true,
    frames: [],
    durations: [],
  };

  // --- teardown ---
  private ro: ResizeObserver | null = null;
  private cellCleanups: Array<() => void> = [];
  private disposed = false;
  private ready = false;

  constructor(T: THREE) {
    this.T = T;
  }

  // ============================================================
  // lifecycle
  // ============================================================
  mount(canvas: HTMLCanvasElement, opts?: EngineMountOpts): void {
    if (this.ready || this.disposed) return;
    this.canvas = canvas;
    if (opts?.hud) this.hud = opts.hud;
    if (opts?.callbacks) this.callbacks = opts.callbacks;
    if (opts?.keysHeld) this.keysHeld = opts.keysHeld;
    if (opts?.aspect) this.aspect = opts.aspect;
    this.build();
    this.attachInteractions();
    this.ready = true;
    // initial paint
    this.updateScene();
    this.updateFormatGuides();
  }

  // Read an app CSS token off the mounted canvas and resolve it to an "rgb(r,g,b)"
  // string via a 1x1 canvas (mirrors CagViewport._rgb). Falls back to a LIGHT value
  // so the scene never reverts to the old dark palette when a token is missing.
  private rgb(name: string, fb: string): string {
    const el = this.canvas || (typeof document !== "undefined" ? document.documentElement : null);
    if (!el) return fb;
    return sampleToken(el, name, fb);
  }

  private build(): void {
    const T = this.T;
    const canvas = this.canvas;

    const renderer = new T.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setScissorTest(true);
    renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer = renderer;

    const scene = new T.Scene();
    this.scene = scene;

    // --- theme-token sampling (mirrors CagViewport._rgb): read the app's LIGHT
    // semantic tokens off the mounted canvas so the whole scene follows [data-theme]. ---
    const cardRgb = this.rgb("--card", "rgb(250,249,245)"); // panel/viewport bg
    const bgRgb = this.rgb("--background", "rgb(240,238,230)"); // page bg -> gutter clear
    const secondaryRgb = this.rgb("--secondary", "rgb(231,228,217)"); // floor
    const gridCenterRgb = this.rgb("--muted-foreground", "rgb(107,102,92)"); // grid center line
    const gridLineRgb = this.rgb("--border", "rgb(219,215,203)"); // grid lines
    const fgRgb = this.rgb("--foreground", "rgb(26,25,21)"); // subject silhouette
    const primaryRgb = this.rgb("--primary", "rgb(217,119,87)"); // camera gizmo / frustum / dot / facing

    this.povBg = new T.Color(cardRgb);
    this.orthoBg = new T.Color(cardRgb);
    this.clearColor = new T.Color(bgRgb);
    // fog color matches the light --card bg so depth SOFTENS (never darkens) the scene.
    this.povFog = new T.Fog(cardRgb, 16, 36);
    scene.background = this.povBg;
    scene.fog = this.povFog;

    // Neutral white-ish lighting so the dark --foreground subject reads as a clean
    // silhouette on the light --card bg (mirrors CagViewport ambient 0.7 + directional 0.5).
    scene.add(new T.HemisphereLight(0xffffff, 0xffffff, 0.7));
    const key = new T.DirectionalLight(0xffffff, 0.5);
    key.position.set(4, 6, 3);
    scene.add(key);
    const rim = new T.DirectionalLight(0xffffff, 0.25);
    rim.position.set(-5, 4, -4);
    scene.add(rim);

    // shared subject material: dark --foreground silhouette on the light scene.
    this.subjMat = new T.MeshStandardMaterial({ color: new T.Color(fgRgb), roughness: 0.85, metalness: 0 });

    const grid = new T.GridHelper(20, 20, new T.Color(gridCenterRgb), new T.Color(gridLineRgb));
    grid.material.opacity = 0.5;
    grid.material.transparent = true; // soften the grid on the light bg
    scene.add(grid);
    const floor = new T.Mesh(
      new T.CircleGeometry(10, 48),
      new T.MeshStandardMaterial({ color: new T.Color(secondaryRgb), roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    scene.add(floor);

    this.person = this.makePerson();
    this.objectSubj = this.makeObject();
    this.objectSubj.visible = false;
    scene.add(this.person, this.objectSubj);

    this.facingGroup = new T.Group();
    this.facingGroup.add(buildFacingCone(T, new T.Color(primaryRgb)));
    scene.add(this.facingGroup);

    const povCam = new T.PerspectiveCamera(40, 16 / 9, 0.05, 80);
    povCam.layers.enable(0);
    this.povCam = povCam;

    const camHelper = new T.CameraHelper(povCam);
    camHelper.layers.set(1);
    camHelper.traverse((o: any) => o.layers.set(1));
    // frustum -> --primary accent (CameraHelper defaults to multicolor vertex colors;
    // force a single accent line color to match CagViewport's accent frustum).
    if (camHelper.material) {
      camHelper.material.vertexColors = false;
      camHelper.material.color = new T.Color(primaryRgb);
      camHelper.material.needsUpdate = true;
    }
    scene.add(camHelper);
    this.camHelper = camHelper;

    const camBody = buildCameraGizmo(T, new T.Color(primaryRgb));
    camBody.traverse((o: any) => o.layers.set(1));
    scene.add(camBody);
    this.camBody = camBody;

    const targetDot = buildTargetDot(T, new T.Color(primaryRgb), 10, 8);
    targetDot.layers.set(1);
    scene.add(targetDot);
    this.targetDot = targetDot;

    this.views = {
      top: { cam: this.makeOrthoCam(), ext: 4.5, u: 0, v: 0, w: 0 },
      bottom: { cam: this.makeOrthoCam(), ext: 4.5, u: 0, v: 0, w: 0 },
      left: { cam: this.makeOrthoCam(), ext: 3.2, u: 0, v: 1.1, w: 0 },
      right: { cam: this.makeOrthoCam(), ext: 3.2, u: 0, v: 1.1, w: 0 },
      front: { cam: this.makeOrthoCam(), ext: 3.2, u: 0, v: 1.1, w: 0 },
      back: { cam: this.makeOrthoCam(), ext: 3.2, u: 0, v: 1.1, w: 0 },
      iso: { cam: this.makeOrthoCam(), ext: 4.2, u: 0, v: 1.0, w: 0 },
    };

    const thumbRenderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    thumbRenderer.setSize(320, 180);
    thumbRenderer.outputColorSpace = T.SRGBColorSpace;
    this.thumbRenderer = thumbRenderer;

    this.clock = new T.Clock();

    // ResizeObserver on the canvas parent (mirrors CagViewport pattern).
    const host = canvas?.parentElement;
    if (host && typeof ResizeObserver !== "undefined") {
      this.ro = new ResizeObserver(() => {
        this.lastW = -1;
      });
      this.ro.observe(host);
    }
  }

  private makePerson(): any {
    // single dark --foreground silhouette material for every part (CagViewport parity);
    // editor variant adds the hair mesh.
    return buildPerson(this.T, this.subjMat, { hair: true });
  }

  private makeObject(): any {
    // single dark --foreground silhouette material for every part (CagViewport parity).
    return buildObject(this.T, this.subjMat);
  }

  private makeOrthoCam(): any {
    const T = this.T;
    const c = new T.OrthographicCamera(-5, 5, 5, -5, 0.1, 200);
    c.layers.enable(0);
    c.layers.enable(1);
    return c;
  }

  dispose(): void {
    this.disposed = true;
    this.stopLoop();
    try {
      if (this.ro) this.ro.disconnect();
    } catch {
      /* ignore */
    }
    this.ro = null;
    this.cellCleanups.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignore */
      }
    });
    this.cellCleanups = [];
    try {
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.forceContextLoss) this.renderer.forceContextLoss();
      }
    } catch {
      /* ignore */
    }
    try {
      if (this.thumbRenderer) {
        this.thumbRenderer.dispose();
        if (this.thumbRenderer.forceContextLoss) this.thumbRenderer.forceContextLoss();
      }
    } catch {
      /* ignore */
    }
    this.renderer = null;
    this.thumbRenderer = null;
    this.scene = null;
    this.canvas = null;
    this.ready = false;
  }

  startLoop(): void {
    if (!this.ready || this.running || this.disposed) return;
    this.running = true;
    this.clock.getDelta(); // reset delta so first frame dt isn't a huge spike
    const tick = () => {
      if (!this.running) return;
      this.rafId = requestAnimationFrame(tick);
      this.frame();
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stopLoop(): void {
    this.running = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ============================================================
  // rig
  // ============================================================
  setRig(partial: Partial<RigState>): void {
    const r = this.rig;
    if (partial.camPos) r.camPos = partial.camPos;
    if (partial.target) r.target = partial.target;
    if (partial.subjPos) r.subjPos = partial.subjPos;
    if (partial.fov !== undefined) r.fov = partial.fov;
    if (partial.roll !== undefined) r.roll = partial.roll;
    if (partial.subj !== undefined) r.subj = partial.subj;
    if (partial.subjRot !== undefined) r.subjRot = partial.subjRot;
    if (partial.trackSubject !== undefined) r.trackSubject = partial.trackSubject;
    if (this.ready) this.updateScene();
  }

  getRig(): RigState {
    return this.rig;
  }

  getOrbit(): { az: number; el: number; dist: number } {
    return orbitFromCart(this.rig.camPos, this.rig.target);
  }

  setOrbit(az: number, el: number, dist: number): void {
    const p = cartFromOrbit(az, el, dist, this.rig.target);
    this.rig.camPos.x = p.x;
    this.rig.camPos.y = p.y;
    this.rig.camPos.z = p.z;
  }

  snapState(): RigSnapshot {
    const r = this.rig;
    return {
      camPos: { ...r.camPos },
      target: { ...r.target },
      subjPos: { ...r.subjPos },
      fov: r.fov,
      roll: r.roll,
      subj: r.subj,
      subjRot: r.subjRot,
      trackSubject: r.trackSubject,
    };
  }

  applyState(snap: RigSnapshot): boolean {
    if (!snap || !snap.camPos || !snap.target || !snap.subjPos) return false;
    const r = this.rig;
    r.camPos = { ...snap.camPos };
    r.target = { ...snap.target };
    r.subjPos = { ...snap.subjPos };
    r.fov = +snap.fov || 40;
    r.roll = +snap.roll || 0;
    r.subj = snap.subj === "object" ? "object" : "person";
    r.subjRot = +snap.subjRot || 0;
    r.trackSubject = !!snap.trackSubject;
    if (this.ready) this.updateScene();
    return true;
  }

  setSubject(subj: "person" | "object"): void {
    this.rig.subj = subj;
    if (this.ready) this.updateScene();
  }

  // ============================================================
  // view / overlay
  // ============================================================
  applyFocus(view: FocusView): void {
    this.focusView = view;
    this.lastW = -1;
  }

  setActiveTab(tab: MainTab): void {
    this.activeTab = tab;
    this.lastW = -1;
  }

  setDragMode(mode: DragMode): void {
    this.dragMode = mode;
  }

  // Public wrapper so the React layer can register the Full-Preview stage as an
  // extra interaction surface (concept attachViewInteraction($('pvViewport'))).
  attachSurface(el: HTMLElement, viewId: ViewId): void {
    this.attachViewInteraction(el, viewId);
  }

  setFrustum(on: boolean): void {
    this.frustumOn = on;
    if (this.camHelper) this.camHelper.visible = on;
  }

  setAspect(aspect: string): void {
    this.aspect = aspect || "16:9";
    this.lastW = -1;
    this.updateFormatGuides();
  }

  // --- reconfigurable quad (Goal B) — imperative; the render loop + ortho
  // interaction resolve each slot through slotView. No re-render needed. ---
  setCellView(slot: SlotId, kind: ViewKind): void {
    this.slotView[slot] = kind;
  }

  setSavedViews(list: SavedView[]): void {
    this.savedViews = list ? list.slice() : [];
  }

  // ============================================================
  // HUD
  // ============================================================
  setHudRefs(refs: EngineHudRefs): void {
    // detach old cell interactions, rebind to the new cell set
    this.cellCleanups.forEach((fn) => fn());
    this.cellCleanups = [];
    this.hud = refs;
    if (this.ready) {
      this.attachInteractions();
      this.updateFormatGuides();
    }
  }

  private outputAspect(): number {
    return aspectNumber(this.aspect);
  }

  updateHud(): void {
    const o = this.getOrbit();
    const angle = angleLabel(o.el, this.rig.roll);
    const shot = shotLabel(o.dist, this.rig.fov, subjHeight(this.rig.subj));
    (this.hud.angleBadges || []).forEach((b) => (b.textContent = angle));
    (this.hud.shotBadges || []).forEach((b) => (b.textContent = shot));
    const html =
      `<span>AZ<b>${Math.round(o.az)}°</b></span>` +
      `<span>EL<b>${Math.round(o.el)}°</b></span>` +
      `<span>DIST<b>${o.dist.toFixed(1)}m</b></span>` +
      `<span>LENS<b>${focalLength(this.rig.fov)}mm</b></span>` +
      `<span>FOV<b>${Math.round(this.rig.fov)}°</b></span>` +
      `<span>ROLL<b>${Math.round(this.rig.roll)}°</b></span>` +
      `<span>H<b>${this.rig.camPos.y.toFixed(2)}m</b></span>` +
      `<span>SUBJ<b>${this.rig.subj === "person" ? tr("view.hudSubjPerson") : tr("view.hudSubjObject")}</b></span>` +
      `<span>OUT<b>${this.aspect} · ${this.fps}FPS</b></span>`;
    (this.hud.readouts || []).forEach((r) => (r.innerHTML = html));
    (this.hud.formatLabels || []).forEach((x) => (x.textContent = this.aspect));
  }

  // ============================================================
  // scene sync (rig -> objects), concept updateScene ~1253-1274
  // ============================================================
  private updateScene(): void {
    if (!this.ready) return;
    const s = this.rig;
    this.person.visible = s.subj === "person";
    this.objectSubj.visible = s.subj === "object";
    [this.person, this.objectSubj, this.facingGroup].forEach((o) => {
      o.position.set(s.subjPos.x, 0, s.subjPos.z);
      o.rotation.y = deg2rad(s.subjRot);
    });
    const y = Math.max(0.07, s.camPos.y);
    this.povCam.position.set(s.camPos.x, y, s.camPos.z);
    this.povCam.up.set(0, 1, 0);
    this.povCam.lookAt(s.target.x, s.target.y, s.target.z);
    this.povCam.rotateZ(deg2rad(s.roll)); // roll AFTER lookAt
    this.povCam.fov = s.fov;
    this.povCam.updateProjectionMatrix();
    this.povCam.updateMatrixWorld(true);
    this.camHelper.update();
    this.camHelper.visible = this.frustumOn;
    this.camBody.position.copy(this.povCam.position);
    this.camBody.quaternion.copy(this.povCam.quaternion);
    this.targetDot.position.set(s.target.x, s.target.y, s.target.z);
    this.updateHud();
  }

  private setupOrtho(id: OrthoId, aspect: number): void {
    const V = this.views![id];
    const c = V.cam;
    if (id === "top") {
      c.position.set(V.u, 60, V.v);
      c.up.set(0, 0, -1);
      c.lookAt(V.u, 0, V.v);
    } else if (id === "bottom") {
      // mirror of top, looking up
      c.position.set(V.u, -60, V.v);
      c.up.set(0, 0, 1);
      c.lookAt(V.u, 0, V.v);
    } else if (id === "left") {
      c.position.set(-60, V.v, V.u);
      c.up.set(0, 1, 0);
      c.lookAt(0, V.v, V.u);
    } else if (id === "right") {
      c.position.set(60, V.v, V.u);
      c.up.set(0, 1, 0);
      c.lookAt(0, V.v, V.u);
    } else if (id === "front") {
      // +Z toward -Z
      c.position.set(V.u, V.v, 60);
      c.up.set(0, 1, 0);
      c.lookAt(V.u, V.v, 0);
    } else if (id === "back") {
      // -Z toward +Z
      c.position.set(V.u, V.v, -60);
      c.up.set(0, 1, 0);
      c.lookAt(V.u, V.v, 0);
    } else {
      // iso
      c.position.set(V.u + 8, V.v + 7, V.w + 8);
      c.up.set(0, 1, 0);
      c.lookAt(V.u, V.v, V.w);
    }
    c.left = -V.ext * aspect;
    c.right = V.ext * aspect;
    c.top = V.ext;
    c.bottom = -V.ext;
    c.updateProjectionMatrix();
  }

  // Resolve a slot's ViewKind to the camera that draws it (ortho preset OR the
  // ONE reused perspective custom cam). Used by BOTH the quad path and the focus
  // path since resolution lives inside renderView.
  private resolveCam(kind: ViewKind, aspect: number): any {
    if (typeof kind === "string" && kind.startsWith("custom:")) {
      const v = this.savedViews.find((s) => "custom:" + s.id === kind);
      return this.setupCustomCam(v ?? { id: "", name: "", az: 30, el: 20, dist: 5 }, aspect);
    }
    this.setupOrtho(kind as OrthoId, aspect);
    return this.views![kind as OrthoId].cam;
  }

  private setupCustomCam(v: SavedView, aspect: number): any {
    const T = this.T;
    if (!this.customCam) {
      this.customCam = new T.PerspectiveCamera(45, 1, 0.05, 200);
      this.customCam.layers.enable(0);
      this.customCam.layers.enable(1); // show subject + frustum/gizmo
    }
    const p = cartFromOrbit(v.az, v.el, v.dist, this.rig.target);
    this.customCam.position.set(p.x, Math.max(0.07, p.y), p.z);
    this.customCam.up.set(0, 1, 0);
    this.customCam.lookAt(this.rig.target.x, this.rig.target.y, this.rig.target.z);
    this.customCam.aspect = aspect;
    this.customCam.updateProjectionMatrix();
    return this.customCam;
  }

  // ============================================================
  // pointer interaction — concept ~1390-1504
  // ============================================================
  private attachInteractions(): void {
    const cells = this.hud.cells || {};
    (Object.keys(cells) as ViewId[]).forEach((id) => {
      const el = cells[id];
      if (el) this.attachViewInteraction(el, id);
    });
  }

  private attachViewInteraction(el: HTMLElement, viewId: ViewId): void {
    let dragging = false;
    let moved = false;
    let btn = 0;
    let px = 0;
    let py = 0;
    let rect: DOMRect | null = null;
    // Active touch points. 1 pointer = orbit/pan (existing); 2 = pinch-to-zoom.
    const pointers = new Map<number, { x: number; y: number }>();
    let pinching = false;
    let pinchDist = 0;
    let pinchMid = { x: 0, y: 0 };

    const twoFingerDist = (): number => {
      const pts = Array.from(pointers.values());
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };
    const twoFingerMid = (): { x: number; y: number } => {
      const pts = Array.from(pointers.values());
      if (pts.length < 2) return { x: 0, y: 0 };
      return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    };

    // Zoom MUTATION only (no render/notify) so a pinch can combine it with a pan
    // in one update. factor>1 dollies OUT; cam = orbit distance, ortho = extent.
    const zoomMutate = (factor: number) => {
      if (viewId === "cam") {
        const o = this.getOrbit();
        this.setOrbit(o.az, o.el, clamp(o.dist * factor, 0.3, 30));
      } else {
        const kind = this.slotView[viewId as SlotId] ?? (viewId as ViewKind);
        if (typeof kind === "string" && kind.startsWith("custom:")) return; // custom = view-only in v1
        const V = this.views![kind as OrthoId];
        V.ext = clamp(V.ext * factor, 0.8, 30);
      }
    };
    // Wheel path: zoom + render + notify in one shot.
    const applyZoom = (factor: number) => {
      this.pb.playing = false;
      zoomMutate(factor);
      this.updateScene();
      this.callbacks.onRigChanged?.();
    };

    const onContext = (e: Event) => e.preventDefault();
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.pb.playing = false; // stopPlayback head-guard
      if (pointers.size >= 2) {
        // second finger down → start pinch/pan, suspend the single-finger orbit
        pinching = true;
        dragging = false;
        moved = false;
        pinchDist = twoFingerDist();
        pinchMid = twoFingerMid();
        rect = el.getBoundingClientRect();
      } else {
        dragging = true;
        moved = false;
        btn = e.button;
        px = e.clientX;
        py = e.clientY;
        rect = el.getBoundingClientRect();
      }
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // mouse self-heal: if a non-touch drag lost its button off-element (a
      // swallowed setPointerCapture means the mouseup never reached us), end the
      // drag here instead of orbiting on an unpressed hover.
      if (dragging && e.pointerType !== "touch" && e.buttons === 0) {
        pointers.delete(e.pointerId);
        dragging = false;
        moved = false;
        return;
      }
      // two-finger gesture = pinch-zoom (distance ratio) + pan (midpoint delta),
      // simultaneously, applied in one render — like a map viewer.
      if (pinching && pointers.size >= 2) {
        const d = twoFingerDist();
        const mid = twoFingerMid();
        this.pb.playing = false;
        // only zoom when the pinch distance ACTUALLY changed — a pure 2-finger pan
        // (factor≈1) must not round-trip getOrbit/setOrbit, which would re-clamp the
        // elevation and pop the camera when it's tilted past the orbit clamp.
        const zf = pinchDist > 0 && d > 0 ? pinchDist / d : 1;
        if (Math.abs(zf - 1) > 1e-3) zoomMutate(zf);
        // pan: btn=2 forces the pan branch of the drag handlers regardless of the
        // active drag-tool mode (standard 2-finger pan). Reuses existing pan math.
        const mdx = mid.x - pinchMid.x;
        const mdy = mid.y - pinchMid.y;
        if (mdx || mdy) {
          if (viewId === "cam") this.handleCamViewDrag(mdx, mdy, 2);
          else {
            const kind = this.slotView[viewId as SlotId] ?? (viewId as ViewKind);
            if (!(typeof kind === "string" && kind.startsWith("custom:")))
              this.handleOrthoDrag(kind as OrthoId, mdx, mdy, 2, rect!);
          }
        }
        this.updateScene();
        this.callbacks.onRigChanged?.();
        pinchDist = d;
        pinchMid = mid;
        return;
      }
      if (!dragging) return;
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 0) moved = true;
      px = e.clientX;
      py = e.clientY;
      if (viewId === "cam") this.handleCamViewDrag(dx, dy, btn);
      else {
        // resolve slot→kind; custom slots are view-only in v1
        const kind = this.slotView[viewId as SlotId] ?? (viewId as ViewKind);
        if (typeof kind === "string" && kind.startsWith("custom:")) return;
        this.handleOrthoDrag(kind as OrthoId, dx, dy, btn, rect!);
      }
      this.updateScene();
      this.callbacks.onRigChanged?.();
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size >= 2) {
        // 3+ fingers, one lifted → re-seed the pinch/pan baseline against the
        // surviving pair so the next move measures a real delta (no jump).
        pinchDist = twoFingerDist();
        pinchMid = twoFingerMid();
        return;
      }
      // ≤1 finger left: end the pinch and any single-finger drag. We deliberately
      // do NOT auto-resume orbit from a lone remaining finger — its release-drift
      // would jerk the camera on every pinch-end. A fresh touch restarts orbit.
      pinching = false;
      if (dragging && moved) this.callbacks.onRigChanged?.();
      dragging = false;
      moved = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyZoom(1 + e.deltaY * 0.001);
    };

    el.addEventListener("contextmenu", onContext);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    this.cellCleanups.push(() => {
      el.removeEventListener("contextmenu", onContext);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    });
  }

  private camVectors(): { right: any; up: any; fwd: any } {
    const T = this.T;
    const right = new T.Vector3().setFromMatrixColumn(this.povCam.matrixWorld, 0);
    const up = new T.Vector3().setFromMatrixColumn(this.povCam.matrixWorld, 1);
    const fwd = new T.Vector3(
      this.rig.target.x - this.rig.camPos.x,
      0,
      this.rig.target.z - this.rig.camPos.z
    );
    if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1);
    fwd.normalize();
    return { right, up, fwd };
  }

  private handleCamViewDrag(dx: number, dy: number, btn: number): void {
    const o = this.getOrbit();
    const pan = btn === 2 || btn === 1;
    if (this.dragMode === "subject" && btn === 0) {
      const { right, fwd } = this.camVectors();
      const s = o.dist * 0.0022;
      this.moveSubjectAbs(right.x * dx * s + fwd.x * -dy * s, right.z * dx * s + fwd.z * -dy * s);
      return;
    }
    if (this.dragMode === "camera" && btn === 0) {
      const { right, up } = this.camVectors();
      const s = o.dist * 0.0016;
      this.rig.camPos.x += right.x * (-dx * s) + up.x * (dy * s);
      this.rig.camPos.y += right.y * (-dx * s) + up.y * (dy * s);
      this.rig.camPos.z += right.z * (-dx * s) + up.z * (dy * s);
      return;
    }
    if (pan) {
      const { right, up } = this.camVectors();
      const s = o.dist * 0.0016;
      const mx = right.x * (-dx * s) + up.x * (dy * s);
      const my = right.y * (-dx * s) + up.y * (dy * s);
      const mz = right.z * (-dx * s) + up.z * (dy * s);
      this.rig.camPos.x += mx;
      this.rig.camPos.y += my;
      this.rig.camPos.z += mz;
      this.rig.target.x += mx;
      this.rig.target.y += my;
      this.rig.target.z += mz;
      return;
    }
    this.setOrbit(norm360(o.az - dx * 0.35), o.el + dy * 0.3, o.dist);
  }

  private moveSubjectAbs(mx: number, mz: number): void {
    const s = this.rig;
    const nx = clamp(s.subjPos.x + mx, -8, 8);
    const nz = clamp(s.subjPos.z + mz, -8, 8);
    const ax = nx - s.subjPos.x;
    const az = nz - s.subjPos.z;
    s.subjPos.x = nx;
    s.subjPos.z = nz;
    if (s.trackSubject) {
      s.target.x += ax;
      s.target.z += az;
    }
  }

  private handleOrthoDrag(
    id: OrthoId,
    dx: number,
    dy: number,
    btn: number,
    rect: DOMRect
  ): void {
    const T = this.T;
    const V = this.views![id];
    const wpp = (2 * V.ext) / rect.height;
    let wx = 0;
    let wy = 0;
    let wz = 0;
    if (id === "top") {
      wx = dx * wpp;
      wz = dy * wpp;
    }
    if (id === "bottom") {
      wx = dx * wpp;
      wz = -dy * wpp;
    }
    if (id === "left") {
      wz = dx * wpp;
      wy = -dy * wpp;
    }
    if (id === "right") {
      wz = -dx * wpp;
      wy = -dy * wpp;
    }
    if (id === "front") {
      wx = dx * wpp;
      wy = -dy * wpp;
    }
    if (id === "back") {
      wx = -dx * wpp;
      wy = -dy * wpp;
    }
    if (id === "iso") {
      const right = new T.Vector3().setFromMatrixColumn(V.cam.matrixWorld, 0);
      const up = new T.Vector3().setFromMatrixColumn(V.cam.matrixWorld, 1);
      wx = right.x * dx * wpp + up.x * -dy * wpp;
      wy = right.y * dx * wpp + up.y * -dy * wpp;
      wz = right.z * dx * wpp + up.z * -dy * wpp;
    }
    if (this.dragMode === "subject" && btn === 0) {
      this.moveSubjectAbs(wx, wz);
      return;
    }
    if (this.dragMode === "camera" && btn === 0) {
      this.rig.camPos.x += wx;
      this.rig.camPos.y = clamp(this.rig.camPos.y + wy, 0.05, 25);
      this.rig.camPos.z += wz;
      return;
    }
    // nav / right-click = pan the view (mutate the ortho view offset)
    if (id === "top") {
      V.u -= dx * wpp;
      V.v -= dy * wpp;
    }
    if (id === "bottom") {
      V.u -= dx * wpp;
      V.v += dy * wpp;
    }
    if (id === "left") {
      V.u -= dx * wpp;
      V.v += dy * wpp;
    }
    if (id === "right") {
      V.u += dx * wpp;
      V.v += dy * wpp;
    }
    if (id === "front") {
      V.u -= dx * wpp;
      V.v += dy * wpp;
    }
    if (id === "back") {
      V.u += dx * wpp;
      V.v += dy * wpp;
    }
    if (id === "iso") {
      V.u -= wx;
      V.v -= wy;
      V.w -= wz;
    }
  }

  // ============================================================
  // keyboard (concept handleKeys ~1566-1605) — reads the shared keysHeld Set
  // ============================================================
  private handleKeys(dt: number): void {
    const keys = this.keysHeld;
    if (!keys.size || !["editor", "preview"].includes(this.activeTab)) return;
    const T = this.T;
    let moved = false;

    const fly = ["w", "a", "s", "d", "q", "e"].some((k) => keys.has(k));
    if (fly) {
      this.pb.playing = false;
      const speed = (keys.has("shift") ? 8.5 : 2.4) * dt;
      const dir = new T.Vector3();
      this.povCam.getWorldDirection(dir);
      const right = new T.Vector3().setFromMatrixColumn(this.povCam.matrixWorld, 0);
      const mv = new T.Vector3();
      if (keys.has("w")) mv.add(dir);
      if (keys.has("s")) mv.sub(dir);
      if (keys.has("d")) mv.add(right);
      if (keys.has("a")) mv.sub(right);
      if (keys.has("e")) mv.y += 1;
      if (keys.has("q")) mv.y -= 1;
      if (mv.lengthSq() > 0) {
        mv.normalize().multiplyScalar(speed);
        this.rig.camPos.x += mv.x;
        this.rig.camPos.y += mv.y;
        this.rig.camPos.z += mv.z;
        this.rig.target.x += mv.x;
        this.rig.target.y += mv.y;
        this.rig.target.z += mv.z;
        this.rig.camPos.y = Math.max(0.07, this.rig.camPos.y);
        moved = true;
      }
    }

    const orb = ["arrowleft", "arrowright", "arrowup", "arrowdown"].some((k) => keys.has(k));
    if (orb) {
      this.pb.playing = false;
      const o = this.getOrbit();
      const sp = (keys.has("shift") ? 150 : 70) * dt;
      let az = o.az;
      let el = o.el;
      if (keys.has("arrowleft")) az -= sp;
      if (keys.has("arrowright")) az += sp;
      if (keys.has("arrowup")) el += sp * 0.7;
      if (keys.has("arrowdown")) el -= sp * 0.7;
      this.setOrbit(norm360(az), el, o.dist);
      moved = true;
    }

    if (moved) {
      this.keyboardMoved = true;
      this.updateScene();
      this.callbacks.onRigChanged?.();
    } else if (this.keyboardMoved && !keys.size) {
      this.keyboardMoved = false;
      this.callbacks.onRigChanged?.();
    }
  }

  // ============================================================
  // thumbnails (concept captureThumb ~1786-1797)
  // ============================================================
  captureThumb(aspect?: string): string {
    if (!this.ready) return "";
    const ratio = aspectNumber(aspect || this.aspect);
    const w = ratio >= 1 ? 320 : Math.max(120, Math.round(320 * ratio));
    const h = ratio >= 1 ? Math.max(120, Math.round(320 / ratio)) : 320;
    const oldAspect = this.povCam.aspect;
    this.thumbRenderer.setSize(w, h);
    // ensure povCam matrices reflect the current rig
    this.updateScene();
    this.povCam.aspect = ratio;
    this.povCam.updateProjectionMatrix();
    this.scene.background = this.povBg;
    this.scene.fog = this.povFog;
    this.thumbRenderer.render(this.scene, this.povCam);
    const url = this.thumbRenderer.domElement.toDataURL("image/jpeg", 0.7);
    this.povCam.aspect = oldAspect;
    this.povCam.updateProjectionMatrix();
    return url;
  }

  // ============================================================
  // playback (concept stepPlayback ~2226-2270) — driven by the rAF loop
  // ============================================================
  setPlayback(pb: Partial<EnginePlayback>): void {
    Object.assign(this.pb, pb);
  }

  private stepPlayback(dt: number): void {
    const fr = this.pb.frames;
    const durs = this.pb.durations;
    const n = fr.length;
    if (!n) {
      this.pb.playing = false;
      this.callbacks.onPlaybackTick?.(this.pb.idx, 0, true);
      return;
    }
    const idxNow = Math.min(this.pb.idx, n - 1);
    const dur = Math.max(0.1, durs[idxNow] || 2);
    const smoothNow = this.pb.smooth;
    this.pb.t += dt / dur;
    const s = this.rig;

    if (smoothNow && n >= 2) {
      if (!this.pb.loop && this.pb.idx === n - 1) {
        // hold/freeze on last frame
        this.applyStateFast(fr[n - 1]);
        let done = false;
        if (this.pb.t >= 1) {
          this.pb.t = 0;
          this.pb.playing = false;
          done = true;
        }
        this.updateScene();
        this.callbacks.onPlaybackTick?.(this.pb.idx, this.pb.t, done);
        return;
      }
      if (this.pb.t >= 1) {
        this.pb.t = 0;
        this.pb.idx = (this.pb.idx + 1) % n;
      }
      const a = fr[this.pb.idx];
      const b = fr[(this.pb.idx + 1) % n];
      const t = this.pb.t;
      const e = smoothstep(t);
      s.camPos = {
        x: lerp(a.camPos.x, b.camPos.x, e),
        y: lerp(a.camPos.y, b.camPos.y, e),
        z: lerp(a.camPos.z, b.camPos.z, e),
      };
      s.target = {
        x: lerp(a.target.x, b.target.x, e),
        y: lerp(a.target.y, b.target.y, e),
        z: lerp(a.target.z, b.target.z, e),
      };
      s.subjPos = { x: lerp(a.subjPos.x, b.subjPos.x, e), z: lerp(a.subjPos.z, b.subjPos.z, e) };
      s.fov = lerp(a.fov, b.fov, e);
      s.roll = lerp(a.roll, b.roll, e);
      s.subjRot = lerpAngle(a.subjRot, b.subjRot, e);
      s.subj = a.subj;
      this.updateScene();
      this.callbacks.onPlaybackTick?.(this.pb.idx, this.pb.t, false);
    } else {
      let done = false;
      if (this.pb.t >= 1) {
        this.pb.t = 0;
        this.pb.idx++;
        if (this.pb.idx >= n) {
          if (this.pb.loop) this.pb.idx = 0;
          else {
            this.pb.idx = n - 1;
            this.pb.playing = false;
            done = true;
          }
        }
        this.applyStateFast(fr[this.pb.idx]);
      }
      this.updateScene();
      this.callbacks.onPlaybackTick?.(this.pb.idx, this.pb.t, done);
    }
  }

  // applyState without an extra updateScene (loop calls updateScene once after)
  private applyStateFast(snap: RigSnapshot): void {
    const r = this.rig;
    r.camPos = { ...snap.camPos };
    r.target = { ...snap.target };
    r.subjPos = { ...snap.subjPos };
    r.fov = +snap.fov || 40;
    r.roll = +snap.roll || 0;
    r.subj = snap.subj === "object" ? "object" : "person";
    r.subjRot = +snap.subjRot || 0;
    r.trackSubject = !!snap.trackSubject;
  }

  // ============================================================
  // sizing + letterbox (concept ensureSize/updateFormatGuide ~2680-2708)
  // ============================================================
  private ensureSize(): void {
    const parent = this.canvas?.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w !== this.lastW || h !== this.lastH) {
      this.renderer.setSize(w, h, false);
      this.lastW = w;
      this.lastH = h;
      this.updateFormatGuides();
    }
  }

  private updateFormatGuides(): void {
    const camCell = this.hud.cells?.cam;
    if (camCell) this.updateFormatGuide(camCell);
  }

  private updateFormatGuide(el: HTMLElement): void {
    if (!el || el.offsetParent === null) return;
    const r = el.getBoundingClientRect();
    const ratio = this.outputAspect();
    let w = r.width;
    let h = r.height;
    let left = 0;
    let top = 0;
    if (w / h > ratio) {
      w = h * ratio;
      left = (r.width - w) / 2;
    } else {
      h = w / ratio;
      top = (r.height - h) / 2;
    }
    // set inheritable --frame-* on the cell; .hud / .thirds / .corner / .format-border inherit
    el.style.setProperty("--frame-left", left + "px");
    el.style.setProperty("--frame-top", top + "px");
    el.style.setProperty("--frame-width", w + "px");
    el.style.setProperty("--frame-height", h + "px");
  }

  private rectOf(el: HTMLElement): { x: number; y: number; w: number; h: number } {
    const cr = this.canvas!.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - cr.left,
      y: cr.height - (r.top - cr.top) - r.height,
      w: r.width,
      h: r.height,
    };
  }

  private fittedRect(
    rect: { x: number; y: number; w: number; h: number },
    ratio: number
  ): { x: number; y: number; w: number; h: number } {
    let { x, y, w, h } = rect;
    if (w / h > ratio) {
      const nw = h * ratio;
      x += (w - nw) / 2;
      w = nw;
    } else {
      const nh = w / ratio;
      y += (h - nh) / 2;
      h = nh;
    }
    return { x, y, w, h };
  }

  private renderView(id: ViewId, rectIn: { x: number; y: number; w: number; h: number }): void {
    if (rectIn.w < 4 || rectIn.h < 4) return;
    let rect = rectIn;
    if (id === "cam") rect = this.fittedRect(rect, this.outputAspect());
    this.renderer.setViewport(rect.x, rect.y, rect.w, rect.h);
    this.renderer.setScissor(rect.x, rect.y, rect.w, rect.h);
    if (id === "cam") {
      this.scene.background = this.povBg;
      this.scene.fog = this.povFog;
      this.povCam.aspect = this.outputAspect();
      this.povCam.updateProjectionMatrix();
      this.renderer.render(this.scene, this.povCam);
    } else {
      // id is the DOM slot (top/left/right/iso); resolve it through the slot map.
      // Non-slot ids (iso) fall back to themselves so iso focus keeps working.
      const kind = this.slotView[id as SlotId] ?? (id as ViewKind);
      this.scene.background = this.orthoBg;
      this.scene.fog = null;
      const cam = this.resolveCam(kind, rect.w / rect.h);
      this.renderer.render(this.scene, cam);
      this.scene.background = this.povBg;
      this.scene.fog = this.povFog;
    }
  }

  // ============================================================
  // the rAF frame (concept loop ~2736-2759)
  // ============================================================
  private frame(): void {
    if (!this.ready || this.disposed) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    this.handleKeys(dt);
    this.callbacks.onKeyTick?.(dt);
    if (this.pb.playing) this.stepPlayback(dt);
    else this.updateScene();

    if (this.activeTab === "guide") return;

    this.ensureSize();
    this.renderer.setScissorTest(false);
    this.renderer.setClearColor(this.clearColor);
    this.renderer.clear();
    this.renderer.setScissorTest(true);

    if (this.activeTab === "preview") {
      this.renderView("cam", { x: 0, y: 0, w: this.lastW, h: this.lastH });
    } else {
      const ids: ViewId[] = this.focusView ? [this.focusView] : ["cam", "top", "left", "right"];
      ids.forEach((id) => {
        const cell = this.hud.cells?.[id];
        if (cell && cell.offsetParent !== null) this.renderView(id, this.rectOf(cell));
      });
    }
  }
}

// --- local interpolation (playback) — mirrors editorMath, inlined to avoid a
// per-frame import indirection in the hot path ---
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function lerpAngle(a: number, b: number, t: number): number {
  return a + norm180(b - a) * t;
}

export default EditorViewportEngine;
