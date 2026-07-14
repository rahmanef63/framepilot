// platforms.ts — SSOT for platform encoding rules + the neutral move maps.
// Pure DATA module (LOC-exempt). Grounded 2025-2026 platform behaviour: the
// SAME camera intent must be encoded differently per target. NO React, NO three.

import { norm180 } from "../editorMath";
import { MoveStrings, NeutralMoveId, Platform } from "./types";

// Azimuth-view label — the horizontal camera direction relative to where the
// subject faces. SAME buckets as editorPrompt.viewEN (front / three-quarter
// front / side profile / three-quarter back / back) so there is ONE definition
// of the view classification (DRY). For the off-axis buckets a side + the
// off-axis degrees are appended to disambiguate; front/back get no side.
export function viewLabel(az: number, subjRot: number): string {
  const rel = norm180(az - subjRot);
  const abs = Math.abs(rel);
  let base: string;
  let sided = true;
  if (abs <= 22) {
    base = "front view";
    sided = false;
  } else if (abs <= 67) {
    base = "three-quarter front view";
  } else if (abs <= 112) {
    base = "side profile view";
  } else if (abs <= 157) {
    base = "three-quarter back view";
  } else {
    base = "back view";
    sided = false;
  }
  if (!sided) return base;
  // ponytail: left/right by rel sign; flip if visually reversed — the ° below keeps it unambiguous.
  const side = rel > 0 ? "from the left" : "from the right";
  return `${base} ${side} (~${Math.round(abs)}° off-axis)`;
}

// The 7 target platforms. `style` drives the skin in encodeShot; `note` is the
// human-facing guidance shown in the panel picker.
export const PLATFORMS: Platform[] = [
  {
    id: "runway",
    label: "Runway",
    style: "sentence",
    oneMove: true,
    note: "Natural sentence, ONE move/shot, always add speed (slow/medium/fast). Camera also settable via UI presets.",
  },
  {
    id: "kling",
    label: "Kling",
    style: "sentence",
    oneMove: true,
    note: "Natural sentence, ONE move/shot, put the move in the first ~8-10 words + a pace word.",
  },
  {
    id: "veo",
    label: "Google Veo",
    style: "sentence",
    oneMove: true,
    note: "Natural sentence, ONE move, write the camera move as its OWN short sentence (\"The camera slowly dollies in.\").",
  },
  {
    id: "luma",
    label: "Luma",
    style: "luma",
    oneMove: false,
    note: "EXACT-STRING style + STACKABLE — append the literal camera string (\"camera push in\"). Multiple moves may be combined; the ONLY platform where stacking is good.",
  },
  {
    id: "hailuo",
    label: "Hailuo / MiniMax",
    style: "bracket",
    oneMove: true,
    note: "BRACKET-TOKEN style — end with [Push in] / [Truck left] tokens, max 3 combined.",
  },
  {
    id: "pika",
    label: "Pika",
    style: "sentence",
    oneMove: true,
    note: "Natural sentence, common-denominator vocab (docs sparse — low confidence; treat as generic sentence).",
  },
  {
    id: "higgsfield",
    label: "Higgsfield",
    style: "sentence",
    oneMove: true,
    note: "Natural sentence + pick ONE named Camera-Motion preset per shot (Dolly In, Crash Zoom, 360 Orbit, Crane Up, Whip Pan, Bullet Time, FPV Drone, Static). The preset drives the camera; keep the move in the text minimal.",
  },
  {
    id: "wan",
    label: "Wan 2.x",
    style: "sentence",
    oneMove: true,
    note: "Alibaba Wan — natural sentence, ONE move/shot, plain camera verbs (dolly in, pan left, tilt up) + a pace word. Sentence style, no bracket/exact-string tokens.",
  },
  {
    id: "seedance",
    label: "Seedance",
    style: "sentence",
    oneMove: true,
    note: "ByteDance Seedance — natural sentence, ONE clear move/shot; strong at multi-shot so keep each shot's camera intent explicit. Add a pace word.",
  },
  {
    id: "ltx",
    label: "LTX Studio",
    style: "sentence",
    oneMove: true,
    note: "LTX Studio / LTX-2 (Lightricks) — flowing PRESENT-TENSE prose (like Veo), never tokens. The camera move is its OWN sentence with a pace word + an END-STATE (\"The camera slowly dollies in, settling on the medium close-up\") — end-state is LTX's biggest coherence lever. In-app you can also seed motion from a Gen Space camera preset.",
  },
];

// neutral move id -> { luma exact-string, hailuo bracket token, inline phrase, veo verb }.
export const MOVE_STRINGS: Record<NeutralMoveId, MoveStrings> = {
  "dolly-in": { luma: "push in", bracket: "Push in", phrase: "push-in", verb: "dollies in" },
  "dolly-out": { luma: "pull out", bracket: "Pull out", phrase: "pull-out", verb: "dollies out" },
  "truck-left": { luma: "truck left", bracket: "Truck left", phrase: "truck-left", verb: "trucks left" },
  "truck-right": { luma: "truck right", bracket: "Truck right", phrase: "truck-right", verb: "trucks right" },
  "pedestal-up": { luma: "pedestal up", bracket: "Pedestal up", phrase: "pedestal-up", verb: "pedestals up" },
  "pedestal-down": { luma: "pedestal down", bracket: "Pedestal down", phrase: "pedestal-down", verb: "pedestals down" },
  "pan-left": { luma: "pan left", bracket: "Pan left", phrase: "pan-left", verb: "pans left" },
  "pan-right": { luma: "pan right", bracket: "Pan right", phrase: "pan-right", verb: "pans right" },
  "tilt-up": { luma: "tilt up", bracket: "Tilt up", phrase: "tilt-up", verb: "tilts up" },
  "tilt-down": { luma: "tilt down", bracket: "Tilt down", phrase: "tilt-down", verb: "tilts down" },
  orbit: { luma: "orbit left", bracket: "Orbit left", phrase: "orbit-left", verb: "orbits left" },
  "crane-up": { luma: "crane up", bracket: "Crane up", phrase: "crane-up", verb: "cranes up" },
  "crane-down": { luma: "crane down", bracket: "Crane down", phrase: "crane-down", verb: "cranes down" },
  handheld: { luma: "handheld", bracket: "Shake", phrase: "handheld move", verb: "moves handheld" },
  static: { luma: "static", bracket: "", phrase: "locked-off", verb: "holds static" },
};

// dataPrompt MOVES labels (what meta.movement stores) -> neutral move id.
// Lowercased keys; "Orbit / Arc" -> orbit, "Crane / Jib" -> crane-up.
export const MOVE_FROM_LABEL: Record<string, NeutralMoveId> = {
  "static / locked-off": "static",
  handheld: "handheld",
  "pan left": "pan-left",
  "pan right": "pan-right",
  "tilt up": "tilt-up",
  "tilt down": "tilt-down",
  "dolly in": "dolly-in",
  "dolly out": "dolly-out",
  "truck left": "truck-left",
  "truck right": "truck-right",
  "pedestal up": "pedestal-up",
  "pedestal down": "pedestal-down",
  "orbit / arc": "orbit",
  "crane / jib": "crane-up",
};

// Reused from editorPrompt.ts angleEN (kept in sync — same wording).
export const ANGLE_EN: Record<string, string> = {
  "BIRD'S EYE": "bird's-eye view",
  "HIGH ANGLE": "high angle",
  "EYE LEVEL": "eye-level shot",
  "LOW ANGLE": "low angle",
  "WORM'S EYE": "worm's-eye view",
};
