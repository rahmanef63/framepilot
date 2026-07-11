// editorMath.ts — pure rig/orbit/shot math for the CAG Editor.
// Ported VERBATIM from concept/camera-angle-guides-pro.html (~lines 1232-1348).
// NO React, NO three. All constants/thresholds are load-bearing — do not change.

export interface Pt3 {
  x: number;
  y: number;
  z: number;
}

// ---- primitive helpers (concept module-globals) ----
export const deg2rad = (d: number): number => (d * Math.PI) / 180;
export const rad2deg = (r: number): number => (r * 180) / Math.PI;
export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
export const norm360 = (a: number): number => ((a % 360) + 360) % 360;
export const norm180 = (a: number): number => {
  a = norm360(a);
  return a > 180 ? a - 360 : a;
};

// ---- interpolation (playback engine) ----
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
// shortest-arc angular lerp (subjRot only)
export const lerpAngle = (a: number, b: number, t: number): number => a + norm180(b - a) * t;
// smoothstep ease e = t*t*(3-2*t)
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

// ---- orbit <-> cartesian (concept getOrbit/setOrbit) ----
export function getOrbit(camPos: Pt3, target: Pt3): { az: number; el: number; dist: number } {
  const dx = camPos.x - target.x;
  const dy = camPos.y - target.y;
  const dz = camPos.z - target.z;
  const dist = Math.max(0.05, Math.sqrt(dx * dx + dy * dy + dz * dz));
  const el = rad2deg(Math.asin(clamp(dy / dist, -1, 1)));
  const az = norm360(rad2deg(Math.atan2(dx, dz)));
  return { az, el, dist };
}

// pure form: returns the new camPos (concept setOrbit re-clamps el & dist)
export function setOrbit(az: number, el: number, dist: number, target: Pt3): Pt3 {
  el = clamp(el, -85, 88);
  dist = clamp(dist, 0.3, 30);
  const e = deg2rad(el);
  const a = deg2rad(az);
  return {
    x: target.x + dist * Math.cos(e) * Math.sin(a),
    y: target.y + dist * Math.sin(e),
    z: target.z + dist * Math.cos(e) * Math.cos(a),
  };
}

// ---- lens / FOV (sensor half-height = 12) ----
export const focalLength = (fov: number): number => Math.round(12 / Math.tan(deg2rad(fov) / 2));
export const fovFromFocal = (mm: number): number => rad2deg(2 * Math.atan(12 / Math.max(1, mm)));

// ---- output aspect ("a:b" -> a/b, fallback 16/9) ----
export function aspectNumber(value: string): number {
  const [a, b] = String(value || "16:9").split(":").map(Number);
  return a > 0 && b > 0 ? a / b : 16 / 9;
}

// ---- subject framing height (person 1.75 / object 1.4) ----
export const subjHeight = (subj: string): number => (subj === "person" ? 1.75 : 1.4);

// ---- shot classifiers (concept angleLabel/shotLabel) ----
export function angleLabel(el: number, roll: number): string {
  let a: string;
  if (el >= 62) a = "BIRD'S EYE";
  else if (el >= 16) a = "HIGH ANGLE";
  else if (el >= -10) a = "EYE LEVEL";
  else if (el >= -40) a = "LOW ANGLE";
  else a = "WORM'S EYE";
  if (Math.abs(roll) >= 7) a += " · DUTCH";
  return a;
}

export function shotLabel(dist: number, fov: number, h: number): string {
  const span = 2 * dist * Math.tan(deg2rad(fov) / 2);
  const r = span / h;
  if (r < 0.3) return "EXTREME CLOSE-UP";
  if (r < 0.58) return "CLOSE-UP";
  if (r < 0.95) return "MEDIUM CLOSE-UP";
  if (r < 1.45) return "MEDIUM SHOT";
  if (r < 2.2) return "FULL SHOT";
  if (r < 3.6) return "WIDE SHOT";
  return "EXTREME WIDE";
}

// ---- shot-size preset distance solve (inverse of shotLabel) ----
// d = clamp((r*h)/(2*tan(fov/2)), 0.3, 30)  — concept shotPresets handler.
export function shotDistance(r: number, fov: number, h: number): number {
  return clamp((r * h) / (2 * Math.tan(deg2rad(fov) / 2)), 0.3, 30);
}
