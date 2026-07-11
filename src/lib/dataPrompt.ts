// Domain logic for the Data Prompt feature, ported from the ds-a prototype
// (DataPromptScreen.dc.html DCLogic). Pure functions + types; no React here.

export const D2R = Math.PI / 180;

// "studio" = a document authored in Studio 3D and persisted to the projects
// store; the other kinds come from the import flow (photo / YouTube / file /
// paste). All of them live in the SAME persistent store now — the source tag is
// just how the Pustaka labels + filters them.
export type SourceKind = "photo" | "youtube" | "file" | "paste" | "studio";

export interface Meta {
  intent: string;
  movement: string;
  action: string;
  lighting: string;
  style: string;
  audio: string;
  duration: number;
  transition: string;
}

export interface RawFrame {
  name: string;
  angle: string;
  shot: string;
  lens: number;
  az: number;
  el: number;
  dist: number;
  roll: number;
  fov: number;
  subj: string;
  meta: Meta;
}

export interface Scene {
  name: string;
  frames: RawFrame[];
}

export interface Entry {
  id: string;
  name: string;
  en: string;
  source: SourceKind;
  ref: string;
  created: number;
  data: { scenes: Scene[] };
}

export interface ProjectScene {
  id: string;
  name: string;
  frames: RawFrame[];
}

export interface Project {
  scenes: ProjectScene[];
}

export const DEF: Meta = {
  intent: "",
  movement: "Static / Locked-off",
  action: "",
  lighting: "",
  style: "",
  audio: "",
  duration: 2,
  transition: "Smooth",
};

export const ANGLES = ["BIRD'S EYE", "HIGH ANGLE", "EYE LEVEL", "LOW ANGLE", "WORM'S EYE"];
export const SHOTS = [
  "EXTREME CLOSE-UP",
  "CLOSE-UP",
  "MEDIUM CLOSE-UP",
  "MEDIUM SHOT",
  "MEDIUM WIDE SHOT",
  "WIDE SHOT",
  "EXTREME WIDE SHOT",
];
export const MOVES = [
  "Static / Locked-off",
  "Handheld",
  "Pan left",
  "Pan right",
  "Tilt up",
  "Tilt down",
  "Dolly in",
  "Dolly out",
  "Truck left",
  "Truck right",
  "Pedestal up",
  "Pedestal down",
  "Orbit / Arc",
  "Crane / Jib",
];
export const ARS = ["16:9", "9:16", "4:5", "1:1", "2.39:1"];
export const FPS = [24, 25, 30, 60];

// [key, label, default, location ("f" = frame field, "m" = meta field)]
export const FIELDS: [string, string, string | number, "f" | "m"][] = [
  ["angle", "Angle", "EYE LEVEL", "f"],
  ["shot", "Shot size", "MEDIUM SHOT", "f"],
  ["lens", "Lens (mm)", 50, "f"],
  ["az", "Azimuth°", 30, "f"],
  ["el", "Elevation°", 4, "f"],
  ["dist", "Distance m", 3, "f"],
  ["intent", "Intent", "", "m"],
  ["movement", "Movement", "Static / Locked-off", "m"],
  ["action", "Action", "", "m"],
  ["lighting", "Lighting", "", "m"],
  ["style", "Style", "", "m"],
  ["audio", "Audio", "", "m"],
];

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

export function seed(now: number): Entry[] {
  const t = now;
  return [
    {
      id: uid(),
      name: "Wawancara duduk",
      en: "Seated interview",
      source: "photo",
      ref: "referensi_wawancara.jpg",
      created: t - 1000 * 60 * 60 * 3,
      data: {
        scenes: [
          {
            name: "Wawancara",
            frames: [
              raw({
                name: "Master",
                angle: "EYE LEVEL",
                shot: "MEDIUM SHOT",
                lens: 50,
                az: 22,
                el: 3,
                dist: 2.4,
                meta: {
                  intent: "Perkenalan narasumber",
                  action: "Narasumber duduk menghadap kamera",
                  movement: "Static / Locked-off",
                } as Meta,
              }),
              raw({
                name: "Insert CU",
                angle: "EYE LEVEL",
                shot: "CLOSE-UP",
                lens: 85,
                az: 18,
                el: 2,
                dist: 1.2,
                meta: { movement: "Handheld" } as Meta,
              }),
            ],
          },
        ],
      },
    },
    {
      id: uid(),
      name: "Estab. drone kota",
      en: "City drone establisher",
      source: "youtube",
      ref: "youtu.be/aX3kR",
      created: t - 1000 * 60 * 60 * 26,
      data: {
        scenes: [
          {
            name: "Opening",
            frames: [
              raw({
                name: "Wide top",
                angle: "BIRD'S EYE",
                shot: "EXTREME WIDE SHOT",
                lens: 24,
                az: 0,
                el: 78,
                dist: 12,
                meta: { intent: "Menetapkan skala kota", movement: "Crane / Jib" } as Meta,
              }),
              raw({
                name: "Orbit",
                angle: "HIGH ANGLE",
                shot: "WIDE SHOT",
                lens: 35,
                az: 60,
                el: 35,
                dist: 8,
                meta: { movement: "Orbit / Arc" } as Meta,
              }),
              raw({
                name: "Descend",
                angle: "EYE LEVEL",
                shot: "MEDIUM WIDE SHOT",
                lens: 35,
                az: 90,
                el: 6,
                dist: 5,
                meta: { movement: "Pedestal down" } as Meta,
              }),
            ],
          },
        ],
      },
    },
    {
      id: uid(),
      name: "Produk hero",
      en: "Product hero low-angle",
      source: "photo",
      ref: "sepatu_hero.png",
      created: t - 1000 * 60 * 60 * 49,
      data: {
        scenes: [
          {
            name: "Produk",
            frames: [
              raw({
                name: "Hero",
                angle: "LOW ANGLE",
                shot: "MEDIUM CLOSE-UP",
                lens: 35,
                az: 12,
                el: -30,
                dist: 0.9,
                meta: {
                  intent: "Kesan megah & premium",
                  style: "Dramatic, high-contrast",
                  movement: "Static / Locked-off",
                } as Meta,
              }),
            ],
          },
        ],
      },
    },
    {
      id: uid(),
      name: "Aksi kejar",
      en: "Chase — dutch handheld",
      source: "file",
      ref: "chase_plan.json",
      created: t - 1000 * 60 * 60 * 72,
      data: {
        scenes: [
          {
            name: "Lorong",
            frames: [
              raw({
                name: "Run",
                angle: "LOW ANGLE",
                shot: "MEDIUM SHOT",
                lens: 28,
                az: 10,
                el: -20,
                dist: 1.8,
                roll: 16,
                meta: { action: "Subjek berlari ke kamera", movement: "Handheld" } as Meta,
              }),
            ],
          },
          {
            name: "Tangga",
            frames: [
              raw({
                name: "Down",
                angle: "HIGH ANGLE",
                shot: "WIDE SHOT",
                lens: 24,
                az: 200,
                el: 42,
                dist: 4,
                meta: { movement: "Tilt down" } as Meta,
              }),
            ],
          },
        ],
      },
    },
  ];
}

export function seedProject(): Project {
  return {
    scenes: [
      {
        id: "p1",
        name: "Scene 1 — Intro",
        frames: [
          raw({
            name: "Establisher",
            angle: "WIDE SHOT",
            shot: "WIDE SHOT",
            lens: 35,
            az: 20,
            el: 8,
            dist: 5,
            meta: { intent: "Menetapkan lokasi" } as Meta,
          }),
        ],
      },
      {
        id: "p2",
        name: "Scene 2 — Dialog",
        frames: [
          raw({ name: "OTS", angle: "EYE LEVEL", shot: "MEDIUM SHOT", lens: 50, az: 35, el: 2, dist: 2.2 }),
          raw({ name: "CU", angle: "EYE LEVEL", shot: "CLOSE-UP", lens: 85, az: 25, el: 2, dist: 1.2 }),
        ],
      },
    ],
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

export interface FillRow {
  label: string;
  value: string;
  filled: boolean;
  tone: "new" | "outline";
  tag: "AI" | "default";
}

export function fillRows(en: Entry): FillRow[] {
  const f = en.data.scenes[0].frames[0];
  return FIELDS.map((row) => {
    const k = row[0],
      label = row[1],
      def = row[2],
      loc = row[3];
    let v: unknown = loc === "m" ? (f.meta as unknown as Record<string, unknown>)[k] : (f as unknown as Record<string, unknown>)[k];
    const empty = v === undefined || v === null || String(v).trim() === "";
    const filled = !empty && String(v) !== String(def);
    return {
      label,
      value: empty ? "—" : String(v),
      filled,
      tone: filled ? "new" : "outline",
      tag: filled ? "AI" : "default",
    } as FillRow;
  });
}

export type SchemaMode = "full" | "simplified";

export function schemaObj(mode: SchemaMode) {
  const frameFull = {
    name: "Shot 1",
    angle: "EYE LEVEL",
    shot: "MEDIUM SHOT",
    lens: 50,
    az: 30,
    el: 4,
    dist: 3.0,
    s: {
      camPos: { x: 0, y: 1.6, z: 3 },
      target: { x: 0, y: 1.35, z: 0 },
      subjPos: { x: 0, z: 0 },
      fov: 40,
      roll: 0,
      subj: "person",
      subjRot: 0,
      trackSubject: false,
    },
    meta: {
      intent: "",
      movement: "Static / Locked-off",
      action: "",
      lighting: "",
      style: "",
      audio: "",
      duration: 2,
      transition: "Smooth",
    },
  };
  const frameSimple = {
    name: "Shot 1",
    angle: "EYE LEVEL",
    shot: "MEDIUM SHOT",
    lens: 50,
    meta: { intent: "", action: "", movement: "Static / Locked-off" },
  };
  const base = {
    schema: "camera-angle-guide/v2",
    _petunjuk:
      "Isi HANYA field yang bisa disimpulkan dari gambar/video. Sisakan field lain pada nilai default. Kembalikan JSON valid saja.",
    _instructions:
      "Fill ONLY the fields you can infer from the image/video. Leave the rest at their defaults. Return valid JSON only.",
    _enums: {
      angle: ANGLES.concat(['(+ " · DUTCH" jika horizon miring)']),
      shot: SHOTS,
      movement: MOVES,
      aspectRatio: ARS,
      fps: FPS,
      transition: ["Smooth", "Cut"],
      subject: ["person", "object"],
    },
  };
  if (mode === "simplified")
    return Object.assign({}, base, { scenes: [{ name: "Scene 1", frames: [frameSimple] }] });
  return Object.assign({}, base, {
    name: "",
    settings: { aspectRatio: "16:9", fps: 24, sensor: "Full Frame" },
    scenes: [{ name: "Scene 1", notes: "", frames: [frameFull] }],
  });
}

export function schemaJson(mode: SchemaMode): string {
  return JSON.stringify(schemaObj(mode), null, 2);
}

export function aiPrompt(src: SourceKind | string, mode: SchemaMode): string {
  const srcTxt =
    (
      {
        photo: "Analisa FOTO terlampir",
        youtube:
          "Tonton VIDEO YouTube ini, screenshot tiap perpindahan scene, dan buat satu frame per scene",
        paste: "Analisa media berikut",
        file: "Analisa media berikut",
      } as Record<string, string>
    )[src] || "Analisa media berikut";
  return [
    "Anda adalah asisten sinematografi. / You are a cinematography assistant.",
    srcTxt +
      ". Hasilkan JSON valid sesuai skema camera-angle-guide/v2 di bawah. / Produce valid JSON matching the schema below.",
    "Fokus: angle, shot size, lens (mm), gerakan kamera. Isi hanya yang terlihat; sisanya biarkan default. Kembalikan HANYA JSON. / Focus on angle, shot size, lens, movement. Fill only what is visible; leave the rest at defaults. Return ONLY JSON.",
    "",
    "SKEMA / SCHEMA (" + mode + "):",
    schemaJson(mode),
  ].join("\n");
}

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

export function fmtWhen(ts: number, now: number): string {
  const h = Math.round((now - ts) / 3600000);
  if (h < 1) return "baru saja";
  if (h < 24) return h + " jam lalu";
  return Math.round(h / 24) + " hari lalu";
}

export const SRC_META: Record<SourceKind, { glyph: string; label: string; tone: "new" | "highlight" | "outline" | "default" }> = {
  studio: { glyph: "◈", label: "Studio 3D", tone: "new" },
  photo: { glyph: "▦", label: "Foto", tone: "new" },
  youtube: { glyph: "▷", label: "YouTube", tone: "highlight" },
  file: { glyph: "≡", label: "File", tone: "outline" },
  paste: { glyph: "▧", label: "Tempel", tone: "default" },
};
