// Data Prompt — constructors + converters (RawFrame → studio project shape) + the
// relative-time formatter. Pure functions; no React.
import { D2R, DEF, type Meta, type RawFrame, type Entry } from "./types";

// --- deterministic id generator (stable across SSR/CSR before mount) ---
let _uid = 0;
export function uid(): string {
  _uid += 1;
  return "e" + _uid.toString(36) + "x";
}

export function raw(f: Partial<RawFrame> = {}): RawFrame {
  return {
    name: f.name || "Shot",
    angle: f.angle || "EYE LEVEL",
    shot: f.shot || "MEDIUM SHOT",
    lens: f.lens == null ? 50 : f.lens,
    az: f.az == null ? 30 : f.az,
    el: f.el == null ? 4 : f.el,
    dist: f.dist == null ? 3 : f.dist,
    roll: f.roll || 0,
    fov: f.fov || 40,
    subj: f.subj || "person",
    meta: Object.assign({}, DEF, f.meta || {}),
  };
}

interface Synth {
  camPos: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  subjPos: { x: number; z: number };
  fov: number;
  roll: number;
  subj: string;
  subjRot: number;
  trackSubject: boolean;
}

export function synth(f: RawFrame): Synth {
  const az = (f.az || 0) * D2R,
    el = (f.el || 0) * D2R,
    d = f.dist || 3,
    ty = 1.35;
  return {
    camPos: {
      x: +(Math.sin(az) * Math.cos(el) * d).toFixed(2),
      y: +(ty + Math.sin(el) * d).toFixed(2),
      z: +(Math.cos(az) * Math.cos(el) * d).toFixed(2),
    },
    target: { x: 0, y: ty, z: 0 },
    subjPos: { x: 0, z: 0 },
    fov: f.fov || 40,
    roll: f.roll || 0,
    subj: f.subj || "person",
    subjRot: 0,
    trackSubject: false,
  };
}

export function projFrame(f: RawFrame) {
  return {
    id: uid(),
    name: f.name,
    notes: "",
    thumb: null,
    angle: f.angle,
    shot: f.shot,
    lens: f.lens,
    az: f.az,
    el: f.el,
    dist: f.dist,
    s: synth(f),
    meta: Object.assign({}, DEF, f.meta || {}),
  };
}

export function entryProject(en: Entry) {
  return {
    schema: "camera-angle-guide/v2",
    name: en.name,
    settings: { aspectRatio: "16:9", fps: 24, sensor: "Full Frame" },
    scenes: en.data.scenes.map((sc) => ({
      id: uid(),
      name: sc.name,
      notes: "",
      frameSeq: sc.frames.length + 1,
      collapsed: false,
      notesOpen: false,
      frames: sc.frames.map((fr) => projFrame(fr)),
    })),
    activeSceneId: null,
  };
}

export function fmtWhen(ts: number, now: number): string {
  const h = Math.round((now - ts) / 3600000);
  if (h < 1) return "baru saja";
  if (h < 24) return h + " jam lalu";
  return Math.round(h / 24) + " hari lalu";
}
