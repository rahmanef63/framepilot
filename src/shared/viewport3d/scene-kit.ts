// scene-kit.ts — shared Three.js geometry/helpers for the two viewport controllers
// (CagViewport + EditorViewportEngine). These build the byte-identical meshes that
// used to be copy-pasted in both engines. Each factory takes the dynamically-imported
// `three` module as `T` (typed `any`, like both callers) so this file stays three-free.
//
// All geometry params / positions are load-bearing and ported VERBATIM from the two
// engines — do NOT tweak. The editor adds a hair mesh to the person (param `hair`);
// the target dot's tessellation differs between callers (params `wseg`/`hseg`).

/* eslint-disable @typescript-eslint/no-explicit-any */
type THREE = any;

// Subject person silhouette (legs/torso/arms/neck/head/nose, + optional hair).
// Returns a Group; every part shares the single passed `mat`.
export function buildPerson(T: THREE, mat: any, opts?: { hair?: boolean }): any {
  const g = new T.Group();
  const legG = new T.CylinderGeometry(0.075, 0.07, 0.82, 10);
  const l1 = new T.Mesh(legG, mat);
  l1.position.set(-0.11, 0.41, 0);
  const l2 = new T.Mesh(legG, mat);
  l2.position.set(0.11, 0.41, 0);
  const torso = new T.Mesh(new T.BoxGeometry(0.38, 0.56, 0.22), mat);
  torso.position.y = 1.1;
  const armG = new T.CylinderGeometry(0.05, 0.045, 0.58, 10);
  const a1 = new T.Mesh(armG, mat);
  a1.position.set(-0.25, 1.06, 0);
  a1.rotation.z = 0.08;
  const a2 = new T.Mesh(armG, mat);
  a2.position.set(0.25, 1.06, 0);
  a2.rotation.z = -0.08;
  const neck = new T.Mesh(new T.CylinderGeometry(0.055, 0.055, 0.09, 10), mat);
  neck.position.y = 1.43;
  const head = new T.Mesh(new T.SphereGeometry(0.125, 20, 16), mat);
  head.position.y = 1.58;
  const nose = new T.Mesh(new T.BoxGeometry(0.04, 0.04, 0.05), mat);
  nose.position.set(0, 1.58, 0.125);
  g.add(l1, l2, torso, a1, a2, neck, head, nose);
  if (opts?.hair) {
    const hair = new T.Mesh(
      new T.SphereGeometry(0.128, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.4),
      mat
    );
    hair.position.y = 1.6;
    g.add(hair);
  }
  return g;
}

// Subject object silhouette (pedestal base + column + cap + torus-knot art).
export function buildObject(T: THREE, mat: any): any {
  const g = new T.Group();
  const base = new T.Mesh(new T.CylinderGeometry(0.32, 0.38, 0.12, 24), mat);
  base.position.y = 0.06;
  const column = new T.Mesh(new T.CylinderGeometry(0.16, 0.2, 0.78, 20), mat);
  column.position.y = 0.51;
  const cap = new T.Mesh(new T.CylinderGeometry(0.26, 0.18, 0.08, 24), mat);
  cap.position.y = 0.94;
  const art = new T.Mesh(new T.TorusKnotGeometry(0.17, 0.055, 120, 16), mat);
  art.position.y = 1.28;
  g.add(base, column, cap, art);
  return g;
}

// Camera gizmo: body box + forward-pointing lens (local -Z = forward). `color` is a
// T.Color. The caller positions/orients it and applies its own layer discipline.
export function buildCameraGizmo(T: THREE, color: any): any {
  const g = new T.Group();
  const mat = new T.MeshBasicMaterial({ color });
  const body = new T.Mesh(new T.BoxGeometry(0.22, 0.18, 0.3), mat);
  const lens = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.14, 12), mat);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = -0.2;
  g.add(body, lens);
  return g;
}

// Accent facing cone (front = +Z). `color` is a T.Color.
export function buildFacingCone(T: THREE, color: any): any {
  const m = new T.Mesh(new T.ConeGeometry(0.08, 0.25, 4), new T.MeshBasicMaterial({ color }));
  m.rotation.x = Math.PI / 2;
  m.position.set(0, 0.02, 0.55);
  return m;
}

// Aim-point target dot. `color` is a T.Color. Tessellation differs per caller
// (editor 10/8, CagViewport 12/10) so segments are params — geometry preserved exactly.
export function buildTargetDot(T: THREE, color: any, wseg = 12, hseg = 10): any {
  return new T.Mesh(new T.SphereGeometry(0.07, wseg, hseg), new T.MeshBasicMaterial({ color }));
}

// Resolve a DS CSS token off `el` to an "rgb(r,g,b)" string via a 1x1 canvas
// fillStyle→getImageData trick. The source element differs per caller (canvas vs host),
// so it is passed in; falls back to `fb` on any failure.
export function sampleToken(el: Element, name: string, fb: string): string {
  try {
    const rawv = getComputedStyle(el).getPropertyValue(name).trim();
    if (!rawv) return fb;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const ctx = cv.getContext("2d");
    if (!ctx) return fb;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillStyle = rawv;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
  } catch {
    return fb;
  }
}
