"use client";
import React, { CSSProperties, useEffect, useRef } from "react";
import { setOrbit, deg2rad, fovFromFocal } from "@/lib/editorMath";
import {
  buildPerson,
  buildObject,
  buildCameraGizmo,
  buildFacingCone,
  buildTargetDot,
  sampleToken,
} from "./scene-kit";

// cag-viewport — a self-contained 3D shot-angle viewport, ported from the
// prototype's cag-viewport.js. Three.js is lazy-loaded (dynamic import) only
// when a viewport mounts, and the renderer is disposed on unmount. Reads the
// ds-a CSS tokens for theming. Shared geometry/token-sampling lives in scene-kit.

export type CamView = "orbit" | "top" | "side" | "pov";

export interface CagViewportProps {
  az?: number;
  el?: number;
  dist?: number;
  lens?: number;
  roll?: number;
  subj?: string;
  camview?: CamView;
  style?: CSSProperties;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type THREE = any;

class Controller {
  host: HTMLElement;
  T: THREE;
  props: Required<Omit<CagViewportProps, "style" | "className">>;
  _r: THREE;
  _scene: THREE;
  _subjGroup: THREE;
  _shotGroup: THREE;
  _subjMat: THREE;
  _persp: THREE;
  _ortho: THREE;
  _shotCam: THREE;
  _viewAz = 42;
  _viewEl = 24;
  _viewDist = 6;
  _userZoomed = false;
  _ty = 1.0;
  _lastSubj = "";
  _camPos: THREE;
  _target: THREE;
  _dist = 3;
  _ro: ResizeObserver | null = null;
  _cleanupDrag: (() => void) | null = null;
  _thirds: HTMLElement | null = null;

  constructor(host: HTMLElement, T: THREE, props: Required<Omit<CagViewportProps, "style" | "className">>) {
    this.host = host;
    this.T = T;
    this.props = props;
    this._build();
    this._update();
    this._resize();
    this._render();
    this._ro = new ResizeObserver(() => {
      this._resize();
      this._render();
    });
    this._ro.observe(host);
  }

  _rgb(name: string, fb: string): string {
    return sampleToken(this.host, name, fb);
  }

  _build() {
    const T = this.T;
    const bg = this._rgb("--card", "rgb(250,249,245)");
    const gridc = this._rgb("--muted-foreground", "rgb(120,116,106)");
    const fg = this._rgb("--foreground", "rgb(26,25,21)");
    const r = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.host.appendChild(r.domElement);
    r.domElement.style.display = "block";
    r.domElement.style.width = "100%";
    r.domElement.style.height = "100%";
    r.setClearColor(new T.Color(bg), 1);
    this._r = r;
    const scene = new T.Scene();
    this._scene = scene;
    scene.add(new T.AmbientLight(0xffffff, 0.7));
    const dl = new T.DirectionalLight(0xffffff, 0.5);
    dl.position.set(4, 9, 6);
    scene.add(dl);
    const grid = new T.GridHelper(8, 8, new T.Color(gridc), new T.Color(gridc));
    grid.material.opacity = 0.32;
    grid.material.transparent = true;
    scene.add(grid);
    this._subjMat = new T.MeshStandardMaterial({ color: new T.Color(fg), roughness: 0.85, metalness: 0.0 });
    this._subjGroup = new T.Group();
    scene.add(this._subjGroup);
    this._shotGroup = new T.Group();
    scene.add(this._shotGroup);
    this._persp = new T.PerspectiveCamera(45, 1, 0.1, 200);
    this._ortho = new T.OrthographicCamera(-4, 4, 4, -4, 0.01, 200);
    this._shotCam = new T.PerspectiveCamera(40, 16 / 9, 0.05, 200);
    this._bindDrag();
    // POV-only rule-of-thirds composition overlay (screen-space, mirrors the editor's
    // .thirds guide). Additive DOM lines — never touches the shot-camera framing.
    if ((this.props.camview || "orbit") === "pov") this._buildThirds();
  }

  _buildThirds() {
    const c = this._rgb("--foreground", "rgb(26,25,21)");
    const line = c.replace("rgb(", "rgba(").replace(")", ",0.22)");
    const ov = document.createElement("div");
    ov.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:1";
    const mk = (css: string) => {
      const d = document.createElement("div");
      d.style.cssText = "position:absolute;background:" + line + ";" + css;
      ov.appendChild(d);
    };
    mk("left:33.33%;top:0;bottom:0;width:1px");
    mk("left:66.66%;top:0;bottom:0;width:1px");
    mk("top:33.33%;left:0;right:0;height:1px");
    mk("top:66.66%;left:0;right:0;height:1px");
    this.host.appendChild(ov);
    this._thirds = ov;
  }

  _buildSubject() {
    const T = this.T;
    const g = this._subjGroup;
    while (g.children.length) g.remove(g.children[0]);
    const subj = this.props.subj || "person";
    const mat = this._subjMat; // light --foreground silhouette (read-only theming preserved)
    // Facing cone (front = +Z), accent-colored — mirrors editorViewportEngine facingGroup.
    const accent = new T.Color(this._rgb("--primary", "rgb(217,119,87)"));
    const facing = buildFacingCone(T, accent);
    if (subj === "object") {
      // pedestal + column + art, in the light --foreground material (editor parity).
      g.add(buildObject(T, mat), facing);
      this._ty = 0.95;
    } else {
      // legs/torso/arms/neck/head, in the light --foreground material. No hair mesh
      // here (that is an editor-only addition) — the Rupa light library subject.
      g.add(buildPerson(T, mat, { hair: false }), facing);
      this._ty = 1.35;
    }
  }

  _update() {
    const T = this.T;
    if (!T) return;
    if (this.props.subj !== this._lastSubj) {
      this._buildSubject();
      this._lastSubj = this.props.subj;
    }
    const az = this.props.az,
      el = this.props.el,
      dist = Math.max(0.5, this.props.dist),
      lens = Math.max(8, this.props.lens),
      roll = this.props.roll;
    const ty = this._ty || 1.0,
      target = new T.Vector3(0, ty, 0);
    const elR = deg2rad(el);
    const p = setOrbit(az, el, dist, { x: 0, y: ty, z: 0 });
    const camPos = new T.Vector3(p.x, p.y, p.z);
    this._camPos = camPos;
    this._target = target;
    this._dist = dist;
    if (!this._userZoomed) this._viewDist = Math.max(4.8, dist * 1.4 + 1.8);
    const vfovR = deg2rad(fovFromFocal(lens));
    const accent = new T.Color(this._rgb("--primary", "rgb(217,119,87)"));

    const g = this._shotGroup;
    while (g.children.length) g.remove(g.children[0]);
    // POV renders what the camera captures — hide the camera-viz aids (gizmo, frustum,
    // ring, target dot) which sit at camPos and would otherwise fill the POV frame with
    // the orange camera object. Mirrors the editor engine's layer discipline.
    g.visible = (this.props.camview || "orbit") !== "pov";

    const fwd = target.clone().sub(camPos).normalize();
    const wup = Math.abs(fwd.y) > 0.95 ? new T.Vector3(0, 0, 1) : new T.Vector3(0, 1, 0);
    let right = new T.Vector3().crossVectors(fwd, wup).normalize();
    let up = new T.Vector3().crossVectors(right, fwd).normalize();
    if (roll) {
      const rr = deg2rad(roll),
        ca = Math.cos(rr),
        sa = Math.sin(rr);
      const nr = right.clone().multiplyScalar(ca).add(up.clone().multiplyScalar(sa));
      const nu = up.clone().multiplyScalar(ca).sub(right.clone().multiplyScalar(sa));
      right = nr;
      up = nu;
    }

    // Camera gizmo (body box + lens) — mirrors editorViewportEngine.camBody. Oriented
    // from the (roll-adjusted) right/up/fwd basis so its lens looks toward the target.
    // Accent-colored so it reads on the light --card background.
    const camGizmo = buildCameraGizmo(T, accent); // local -Z = forward (toward target)
    camGizmo.position.copy(camPos);
    camGizmo.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(right, up, fwd.clone().negate()));
    g.add(camGizmo);

    // Target dot at the aim point — mirrors editorViewportEngine.targetDot.
    const dot = buildTargetDot(T, accent);
    dot.position.copy(target);
    g.add(dot);

    const L = dist * 0.9,
      hh = Math.tan(vfovR / 2) * L,
      hw = hh * (16 / 9);
    const center = camPos.clone().add(fwd.clone().multiplyScalar(L));
    const c1 = center.clone().add(right.clone().multiplyScalar(hw)).add(up.clone().multiplyScalar(hh));
    const c2 = center.clone().add(right.clone().multiplyScalar(hw)).add(up.clone().multiplyScalar(-hh));
    const c3 = center.clone().add(right.clone().multiplyScalar(-hw)).add(up.clone().multiplyScalar(-hh));
    const c4 = center.clone().add(right.clone().multiplyScalar(-hw)).add(up.clone().multiplyScalar(hh));
    const pts = [camPos, c1, camPos, c2, camPos, c3, camPos, c4, c1, c2, c2, c3, c3, c4, c4, c1];
    g.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: accent })));

    const R = Math.max(0.001, Math.cos(elR) * dist);
    const rp = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      rp.push(new T.Vector3(Math.sin(a) * R, 0.02, Math.cos(a) * R));
    }
    const ringMat = new T.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.4 });
    g.add(new T.Line(new T.BufferGeometry().setFromPoints(rp), ringMat));
    g.add(
      new T.Line(
        new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0.02, 0), new T.Vector3(camPos.x, 0.02, camPos.z)]),
        ringMat
      )
    );

    this._shotCam.fov = (vfovR * 180) / Math.PI;
    this._shotCam.position.copy(camPos);
    this._shotCam.up.copy(up);
    this._shotCam.lookAt(target);
    this._shotCam.updateProjectionMatrix();
  }

  _setOrtho(H: number) {
    const w = this.host.clientWidth || 300,
      h = this.host.clientHeight || 200,
      as = w / Math.max(1, h);
    this._ortho.left = -H * as;
    this._ortho.right = H * as;
    this._ortho.top = H;
    this._ortho.bottom = -H;
    this._ortho.near = 0.01;
    this._ortho.far = 200;
    this._ortho.updateProjectionMatrix();
  }

  _viewCam() {
    const T = this.T;
    const cv = this.props.camview || "orbit";
    const t = this._target || new T.Vector3(0, 1, 0);
    const dist = this._dist || 3;
    if (cv === "pov") return this._shotCam;
    if (cv === "top") {
      this._ortho.position.set(0, 12, 0);
      this._ortho.up.set(0, 0, -1);
      this._ortho.lookAt(0, 0, 0);
      this._setOrtho(Math.max(3.8, dist * 0.75));
      return this._ortho;
    }
    if (cv === "side") {
      this._ortho.position.set(11, t.y, 0.001);
      this._ortho.up.set(0, 1, 0);
      this._ortho.lookAt(t);
      this._setOrtho(Math.max(3.2, dist * 0.72));
      return this._ortho;
    }
    const p = setOrbit(this._viewAz, this._viewEl, this._viewDist, { x: t.x, y: t.y, z: t.z });
    this._persp.position.set(p.x, p.y, p.z);
    this._persp.up.set(0, 1, 0);
    this._persp.lookAt(t);
    return this._persp;
  }

  _resize() {
    if (!this._r) return;
    const w = this.host.clientWidth || 300,
      h = this.host.clientHeight || 200;
    this._r.setSize(w, h, false);
    this._persp.aspect = w / Math.max(1, h);
    this._persp.updateProjectionMatrix();
  }

  _render() {
    if (this._r && this._scene) this._r.render(this._scene, this._viewCam());
  }

  _bindDrag() {
    const self = this;
    const el = this._r.domElement as HTMLCanvasElement;
    let drag = false,
      px = 0,
      py = 0;
    el.style.touchAction = "none";
    const isOrbit = () => (self.props.camview || "orbit") === "orbit";
    el.style.cursor = isOrbit() ? "grab" : "default";
    const onDown = (e: PointerEvent) => {
      if (!isOrbit()) return;
      drag = true;
      px = e.clientX;
      py = e.clientY;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - px,
        dy = e.clientY - py;
      px = e.clientX;
      py = e.clientY;
      self._viewAz -= dx * 0.4;
      self._viewEl = Math.max(-80, Math.min(82, self._viewEl + dy * 0.35));
      self._render();
    };
    const onUp = () => {
      drag = false;
      el.style.cursor = isOrbit() ? "grab" : "default";
    };
    const onWheel = (e: WheelEvent) => {
      if (!isOrbit()) return;
      e.preventDefault();
      self._userZoomed = true;
      self._viewDist = Math.max(2.6, Math.min(18, self._viewDist * (1 + e.deltaY * 0.001)));
      self._render();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    this._cleanupDrag = () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }

  setProps(props: Required<Omit<CagViewportProps, "style" | "className">>) {
    this.props = props;
    if (this._T() && this._scene) {
      this._update();
      this._render();
    }
  }
  _T() {
    return this.T;
  }

  dispose() {
    try {
      if (this._cleanupDrag) this._cleanupDrag();
      if (this._thirds && this._thirds.parentNode) this._thirds.parentNode.removeChild(this._thirds);
      this._thirds = null;
      if (this._ro) this._ro.disconnect();
      if (this._r) {
        this._r.dispose();
        if (this._r.forceContextLoss) this._r.forceContextLoss();
        if (this._r.domElement && this._r.domElement.parentNode)
          this._r.domElement.parentNode.removeChild(this._r.domElement);
      }
    } catch {
      /* ignore */
    }
    this._scene = null;
    this._r = null;
  }
}

export function CagViewport({
  az = 30,
  el = 4,
  dist = 3,
  lens = 50,
  roll = 0,
  subj = "person",
  camview = "orbit",
  style,
  className,
}: CagViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ctrlRef = useRef<Controller | null>(null);
  const propsRef = useRef({ az, el, dist, lens, roll, subj, camview });
  propsRef.current = { az, el, dist, lens, roll, subj, camview };

  // build once on mount (lazy-load three)
  useEffect(() => {
    let alive = true;
    const host = hostRef.current;
    if (!host) return;
    import("three")
      .then((T) => {
        if (!alive || !host) return;
        ctrlRef.current = new Controller(host, T, propsRef.current);
      })
      .catch(() => {
        if (host)
          host.innerHTML =
            '<div style="width:100%;height:100%;display:grid;place-items:center;font:600 10px monospace;color:#999">3D tak tersedia</div>';
      });
    return () => {
      alive = false;
      if (ctrlRef.current) {
        ctrlRef.current.dispose();
        ctrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // push prop changes to the live controller
  useEffect(() => {
    if (ctrlRef.current) ctrlRef.current.setProps({ az, el, dist, lens, roll, subj, camview });
  }, [az, el, dist, lens, roll, subj, camview]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ display: "block", position: "relative", overflow: "hidden", ...style }}
    />
  );
}
