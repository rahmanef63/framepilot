// types.ts — shared types for the platform-tuned camera-prompt engine.
// The CAMERA prompt is the hero output: the size+angle+subject+lens+ONE
// movement+speed+framing string the user pastes INTO an AI video-gen platform.
// Pure types — NO React, NO three.

// The target AI video platforms we encode for.
export type PlatformId =
  | "runway" | "kling" | "veo" | "sora" | "luma" | "hailuo" | "pika"
  | "higgsfield" | "wan" | "seedance";

// How a platform wants the camera move expressed:
//  - "sentence": one natural-language sentence (move woven in).
//  - "luma":     natural sentence MINUS the move + ", camera <exact string>".
//  - "bracket":  natural sentence MINUS the move + " [Bracket] tokens".
export type PlatformStyle = "sentence" | "luma" | "bracket";

export interface Platform {
  id: PlatformId;
  label: string;
  style: PlatformStyle;
  oneMove: boolean; // true = exactly one move per shot (all except luma stacking)
  note: string; // encoding guidance for the panel UI
}

// Neutral, platform-agnostic move ids — the internal representation. Each maps
// to a luma exact-string and a hailuo bracket token via MOVE_STRINGS.
export type NeutralMoveId =
  | "dolly-in"
  | "dolly-out"
  | "truck-left"
  | "truck-right"
  | "pedestal-up"
  | "pedestal-down"
  | "pan-left"
  | "pan-right"
  | "tilt-up"
  | "tilt-down"
  | "orbit"
  | "crane-up"
  | "crane-down"
  | "handheld"
  | "static";

export type Speed = "slow" | "medium" | "fast";

export interface MoveStrings {
  luma: string; // exact camera string, no "camera" prefix, e.g. "push in"
  bracket: string; // bracket token text, no brackets, e.g. "Push in"
  phrase: string; // inline noun phrase for sentences, e.g. "push-in"
  verb: string; // 3rd-person verb for veo's own-sentence form, e.g. "dollies in"
}

// The internal neutral representation of ONE shot's camera intent:
// "[SHOT SIZE] [ANGLE] of [SUBJECT], [LENS] [DOF], [ONE MOVE] + [SPEED], [FRAMING]"
export interface NeutralShot {
  name?: string;
  size: string; // "medium close-up"
  angle: string; // "low angle"
  subject: string; // "a standing person"
  lens: string; // "35mm full-frame lens"
  dof: string; // "shallow depth of field"
  move: NeutralMoveId;
  speed: Speed;
  framing: string; // "16:9 framing"
  extraMoves?: NeutralMoveId[]; // luma-only: stacked additional moves
  // ---- real 3D camera geometry (so every platform prompt carries position) ----
  view: string; // "three-quarter front view from the left (~35° off-axis)"
  elevationPhrase: string; // "above the subject, looking down ~20°"
  height: string; // "~2.4 m high"
  distance: string; // "~3.0 m from subject"
  dutch: string; // "dutch tilt ~12°" or "" when level
}

export interface ProjectMeta {
  aspectRatio?: string;
}

// Which optional clauses the user folds INTO the shown/copied camera prompt.
// Toggled live (checkbox dropdown) in the Prompt dock; every pure encoder takes
// it and defaults to ALL_ON so all existing call sites stay byte-identical.
export interface ShotOptions {
  lens: boolean; // "35mm full-frame lens"
  dof: boolean; // "shallow depth of field"
  elevation: boolean; // "above the subject, looking down ~20°"
  view: boolean; // "three-quarter front view …"
  distance: boolean; // "~3.0 m from subject"
  height: boolean; // "~2.4 m high"
  dutch: boolean; // "dutch tilt ~12°"
  move: boolean; // the camera movement clause / static wording
  framing: boolean; // "16:9 framing"
}

export const ALL_ON: ShotOptions = {
  lens: true,
  dof: true,
  elevation: true,
  view: true,
  distance: true,
  height: true,
  dutch: true,
  move: true,
  framing: true,
};
