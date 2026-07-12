// cameraPrompt.ts — the platform-tuned camera-prompt ENCODER (the hero output).
// toNeutral() reuses the existing dataPrompt/editorPrompt English vocab to build
// a platform-agnostic NeutralShot; encodeShot() skins it per target platform.
// Pure functions — NO React, NO three.

import { EditorFrame, EditorProject, EditorScene } from "../editorModel";
import { RawFrame } from "../dataPrompt";
import { deg2rad } from "../editorMath";
import { ANGLE_EN, MOVE_FROM_LABEL, MOVE_STRINGS, viewLabel } from "./platforms";
import { NeutralMoveId, NeutralShot, PlatformId, ProjectMeta, Speed } from "./types";

// A frame from either the editor model (has s.subj + meta.movement) or the
// lightweight AppState/library shape (RawFrame: subj + meta.movement).
type ShotInput = EditorFrame | RawFrame;

const cap = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const ADVERB: Record<Speed, string> = { slow: "slowly", medium: "steadily", fast: "quickly" };

// Deliberate rig moves read slow; whip/handheld reads fast; pan/tilt medium.
function speedOf(move: NeutralMoveId): Speed {
  if (move === "handheld") return "fast";
  if (move === "pan-left" || move === "pan-right" || move === "tilt-up" || move === "tilt-down") return "medium";
  return "slow";
}

// person -> a standing person / object -> a sculptural object on a pedestal
// (mirrors editorPrompt.subjEN). Reads either s.subj (editor) or subj (raw).
function subjectOf(f: ShotInput): string {
  const subj = (f as EditorFrame).s?.subj ?? (f as RawFrame).subj ?? "person";
  return subj === "object" ? "a sculptural object on a pedestal" : "a standing person";
}

function dofOf(size: string, lens: number): string {
  if (/close/.test(size) || lens >= 70) return "shallow depth of field";
  if (/wide/.test(size) || lens <= 28) return "deep depth of field";
  return "moderate depth of field";
}

// ShotInput -> NeutralShot, reusing existing angle/shot/lens/subject wording.
export function toNeutral(f: ShotInput, meta: ProjectMeta = {}): NeutralShot {
  const movementLabel = String((f.meta && f.meta.movement) || "Static / Locked-off").toLowerCase();
  const move: NeutralMoveId = MOVE_FROM_LABEL[movementLabel] || "static";
  const baseAngle = String(f.angle || "EYE LEVEL").replace(" · DUTCH", "");
  const size = String(f.shot || "MEDIUM SHOT").toLowerCase();
  const lensMm = Math.round(Number(f.lens) || 50);

  // Read the real 3D camera geometry from EITHER shape: EditorFrame keeps
  // roll/fov/subjRot/camPos in `s`; RawFrame keeps roll/fov top-level (no
  // subjRot, no camPos). Fall back to synthesising the height from el + dist.
  const ef = f as EditorFrame;
  const rf = f as RawFrame;
  const az = Number(f.az) || 0;
  const el = Number(f.el) || 0;
  const dist = Number(f.dist) || 3;
  const roll = ef.s?.roll ?? rf.roll ?? 0;
  const subjRot = ef.s?.subjRot ?? 0;
  const rawSubj = ef.s?.subj ?? rf.subj ?? "person";
  const targetY = rawSubj === "object" ? 1.0 : 1.35;
  const camHeight = ef.s?.camPos?.y ?? targetY + dist * Math.sin(deg2rad(el));

  const view = viewLabel(az, subjRot);
  const elevationPhrase =
    Math.abs(el) <= 6
      ? "at eye level"
      : el > 6
        ? `above the subject, looking down ~${Math.round(el)}°`
        : `below the subject, looking up ~${Math.round(-el)}°`;
  const height = `~${camHeight.toFixed(1)} m high`;
  const distance = `~${dist.toFixed(1)} m from subject`;
  const dutch = Math.abs(roll) >= 7 ? `dutch tilt ~${Math.round(Math.abs(roll))}°` : "";

  return {
    name: f.name,
    size,
    angle: ANGLE_EN[baseAngle] || baseAngle.toLowerCase(),
    subject: subjectOf(f),
    lens: `${lensMm}mm full-frame lens`,
    dof: dofOf(size, lensMm),
    move,
    speed: speedOf(move),
    framing: `${meta.aspectRatio || "16:9"} framing`,
    view,
    elevationPhrase,
    height,
    distance,
    dutch,
  };
}

// The positional camera clause — the REAL 3D geometry (elevation + azimuth-view
// + distance + height + optional dutch). Folded into every skin so no platform
// ever loses the camera position.
export function cameraLine(n: NeutralShot): string {
  return (
    `camera ${n.elevationPhrase}, ${n.view}, ${n.distance}, ${n.height}` +
    (n.dutch ? `, ${n.dutch}` : "")
  );
}

// Natural sentence WITHOUT the move (used by veo/luma/hailuo skins).
function baseSentence(n: NeutralShot): string {
  return `${n.size} ${n.angle} of ${n.subject}, ${n.lens} ${n.dof}, ${cameraLine(n)}, ${n.framing}`;
}

// Natural sentence WITH the move woven in (runway/pika + sentence default).
function fullSentence(n: NeutralShot): string {
  const mv = MOVE_STRINGS[n.move];
  return `${n.size} ${n.angle} of ${n.subject}, ${n.lens} ${n.dof}, ${cameraLine(n)}, ${n.speed} ${mv.phrase}, ${n.framing}`;
}

// Render one NeutralShot into the paste-ready string for the given platform.
export function encodeShot(n: NeutralShot, platformId: PlatformId): string {
  const mv = MOVE_STRINGS[n.move];
  const isStatic = n.move === "static";
  switch (platformId) {
    case "runway":
      return isStatic ? `${baseSentence(n)}, locked-off camera` : fullSentence(n);
    case "kling":
      // move in the first ~8-10 words + a pace word (camera geometry after size)
      return isStatic
        ? `Static ${n.size}, ${n.angle} of ${n.subject}, ${n.lens} ${n.dof}, ${cameraLine(n)}, ${n.framing}`
        : `${cap(n.speed)} ${mv.phrase} on ${n.subject}, ${n.size} ${n.angle}, ${n.lens} ${n.dof}, ${cameraLine(n)}, ${n.framing}`;
    case "veo": {
      // camera move as its OWN short sentence (baseSentence already carries geometry)
      const b = baseSentence(n);
      return isStatic ? `${b}. The camera holds static.` : `${b}. The camera ${ADVERB[n.speed]} ${mv.verb}.`;
    }
    case "sora":
      // lead with the frame, keep the move a short clause (geometry before the move)
      return isStatic
        ? `${cap(n.framing)} frame: ${n.size} ${n.angle} of ${n.subject}, ${n.lens} ${n.dof}, ${cameraLine(n)}, static.`
        : `${cap(n.framing)} frame: ${n.size} ${n.angle} of ${n.subject}, ${n.lens} ${n.dof}, ${cameraLine(n)}, ${n.speed} ${mv.phrase}.`;
    case "luma": {
      // EXACT-STRING + STACKABLE: append literal camera string(s).
      const moves = [n.move, ...(n.extraMoves || [])];
      if (isStatic && moves.length === 1) return `${baseSentence(n)}, static camera`;
      const strs = moves.map((m) => MOVE_STRINGS[m].luma);
      let cam = `camera ${strs[0]}`;
      for (let i = 1; i < strs.length; i++) cam += `, combine ${strs[i - 1]} with ${strs[i]}`;
      return `${baseSentence(n)}, ${cam}`;
    }
    case "hailuo": {
      // BRACKET-TOKEN: end with [Token]s, max 3 combined.
      if (isStatic) return baseSentence(n);
      const toks = [n.move, ...(n.extraMoves || [])]
        .map((m) => MOVE_STRINGS[m].bracket)
        .filter(Boolean)
        .slice(0, 3);
      return `${baseSentence(n)} ${toks.map((t) => `[${t}]`).join(" ")}`;
    }
    case "pika":
    case "higgsfield":
    case "wan":
    case "seedance":
    default:
      // Every sentence-style platform (present + future) inherits the same skin.
      return isStatic ? `${baseSentence(n)}, static camera` : fullSentence(n);
  }
}

// One block per shot (each shot on its own — ONE move per shot is respected).
export function encodeScene(scene: EditorScene, platformId: PlatformId, meta: ProjectMeta = {}): string {
  return scene.frames
    .map((f, i) => `# ${f.name || `Shot ${i + 1}`}\n${encodeShot(toNeutral(f, meta), platformId)}`)
    .join("\n\n");
}

// Whole project -> multi-shot output, one block per shot across all scenes.
export function encodeProject(project: EditorProject, platformId: PlatformId): string {
  const meta: ProjectMeta = { aspectRatio: project.settings?.aspectRatio };
  return project.scenes.map((sc) => encodeScene(sc, platformId, meta)).join("\n\n");
}
