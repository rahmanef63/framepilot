// Data Prompt — shared types + vocabulary constants (pure data). Split out of the
// former single dataPrompt.ts so each concern is its own file (rr modularity); the
// @/lib/dataPrompt barrel re-exports everything, so import sites are unchanged.

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

export const SRC_META: Record<SourceKind, { glyph: string; label: string; tone: "new" | "highlight" | "outline" | "default" }> = {
  studio: { glyph: "◈", label: "Studio 3D", tone: "new" },
  photo: { glyph: "▦", label: "Foto", tone: "new" },
  youtube: { glyph: "▷", label: "YouTube", tone: "highlight" },
  file: { glyph: "≡", label: "File", tone: "outline" },
  paste: { glyph: "▧", label: "Tempel", tone: "default" },
};
