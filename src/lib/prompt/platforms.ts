// platforms.ts — SSOT for platform encoding rules + the neutral move maps.
// Pure DATA module (LOC-exempt). Grounded 2025-2026 platform behaviour: the
// SAME camera intent must be encoded differently per target. NO React, NO three.

import { MoveStrings, NeutralMoveId, Platform } from "./types";

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
    id: "sora",
    label: "Sora",
    style: "sentence",
    oneMove: true,
    note: "Natural sentence, lead with the frame, one clause size+angle+lens+move, keep the move 5-10 words.",
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
