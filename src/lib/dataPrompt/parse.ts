// Data Prompt — tolerant parser for incoming AI JSON (any of several shapes) into
// the canonical Scene[]. Pure.
import { DEF, type Meta, type RawFrame, type Scene } from "./types";

function normFrame(f: unknown): RawFrame {
  const ff = (f || {}) as Record<string, unknown>;
  const s = (ff.s || {}) as Record<string, unknown>;
  const meta = Object.assign({}, DEF, (ff.meta || {}) as Partial<Meta>);
  const num = (v: unknown, d: number) => (Number.isFinite(+(v as number)) ? +(v as number) : d);
  return {
    name: (ff.name as string) || "Shot",
    angle: (ff.angle as string) || "EYE LEVEL",
    shot: (ff.shot as string) || "MEDIUM SHOT",
    lens: num(ff.lens, 50),
    az: num(ff.az, 30),
    el: num(ff.el, 4),
    dist: num(ff.dist, 3),
    roll: Number.isFinite(+(s.roll as number)) ? +(s.roll as number) : +(ff.roll as number) || 0,
    fov: Number.isFinite(+(s.fov as number)) ? +(s.fov as number) : +(ff.fov as number) || 40,
    subj: (s.subj as string) || (ff.subj as string) || "person",
    meta,
  };
}

export function toScenes(obj: unknown): Scene[] | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  if (Array.isArray(o.scenes))
    return (o.scenes as unknown[])
      .map((sc, i) => {
        const s = sc as Record<string, unknown>;
        return {
          name: (s.name as string) || "Scene " + (i + 1),
          frames: ((s.frames as unknown[]) || []).map((fr) => normFrame(fr)),
        };
      })
      .filter((sc) => sc.frames.length);
  if (Array.isArray(o.frames))
    return [{ name: (o.name as string) || "Scene 1", frames: (o.frames as unknown[]).map((fr) => normFrame(fr)) }];
  if (o.angle || o.shot || o.s || o.meta || o.lens)
    return [{ name: "Scene 1", frames: [normFrame(o)] }];
  return null;
}
