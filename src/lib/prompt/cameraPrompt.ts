// cameraPrompt.ts — the platform-tuned camera-prompt ENCODER (the hero output).
// toNeutral() reuses the existing dataPrompt/editorPrompt English vocab to build
// a platform-agnostic NeutralShot; encodeShot() skins it per target platform.
// Pure functions — NO React, NO three.

import { EditorFrame, EditorProject, EditorScene } from "../editorModel";
import { RawFrame } from "../dataPrompt";
import { deg2rad } from "../editorMath";
import { cameraPhrase, effectiveCameraId } from "../cameras";
import { ANGLE_EN, MOVE_FROM_LABEL, MOVE_STRINGS, viewLabel } from "./platforms";
import { ALL_ON, NeutralMoveId, NeutralShot, PlatformId, ProjectMeta, ShotOptions, Speed } from "./types";

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
    // resolved camera look tag ("" when none/global-off-and-unset → dropped by J())
    cameraGear: cameraPhrase(effectiveCameraId((f as EditorFrame).camera, meta)),
  };
}

// Join only the non-empty clauses with ", " (an OFF toggle yields "" → dropped).
const J = (parts: (string | false | null | undefined)[]): string =>
  parts.filter((p): p is string => Boolean(p)).join(", ");

// lens + dof, each independently toggleable (they share one comma-clause,
// space-joined: "35mm full-frame lens shallow depth of field").
const lensDof = (n: NeutralShot, o: ShotOptions): string =>
  [o.lens ? n.lens : "", o.dof ? n.dof : ""].filter(Boolean).join(" ");

// The positional camera clause — the REAL 3D geometry (elevation + azimuth-view
// + distance + height + optional dutch). Each part is individually toggleable;
// returns "" when the user unchecks every geometry field. Folded into every skin
// so no platform ever loses the camera position unless the user opts out.
function cameraLine(n: NeutralShot, o: ShotOptions = ALL_ON): string {
  const parts = J([
    o.elevation ? n.elevationPhrase : "",
    o.view ? n.view : "",
    o.distance ? n.distance : "",
    o.height ? n.height : "",
    o.dutch ? n.dutch : "", // n.dutch is already "" when the shot is level
  ]);
  return parts ? `camera ${parts}` : "";
}

// Render one NeutralShot into the paste-ready string for the given platform.
// `o` picks which optional clauses are folded in (default = everything).
export function encodeShot(n: NeutralShot, platformId: PlatformId, o: ShotOptions = ALL_ON): string {
  const mv = MOVE_STRINGS[n.move];
  const head = `${n.size} ${n.angle} of ${n.subject}`;
  const ld = lensDof(n, o);
  const cam = cameraLine(n, o);
  const fr = o.framing ? n.framing : "";
  // "shot on <brand/model>" look tag — rides right after the geometry clause; ""
  // (no camera / toggle off) is dropped by J(), so output is unchanged until opt-in.
  const gear = o.camera ? n.cameraGear : "";

  // Move hidden → ONE clean base sentence for every platform (no idiom, no
  // "static"/"locked-off" wording — that IS movement info the user opted out of).
  if (!o.move) return J([head, ld, cam, gear, fr]);

  const isStatic = n.move === "static";
  switch (platformId) {
    case "runway":
      return isStatic ? J([head, ld, cam, gear, fr, "locked-off camera"]) : J([head, ld, cam, gear, `${n.speed} ${mv.phrase}`, fr]);
    case "kling":
      // move in the first ~8-10 words + a pace word (camera geometry after size)
      return isStatic
        ? J([`Static ${n.size}`, `${n.angle} of ${n.subject}`, ld, cam, gear, fr])
        : J([`${cap(n.speed)} ${mv.phrase} on ${n.subject}`, `${n.size} ${n.angle}`, ld, cam, gear, fr]);
    case "veo": {
      // camera move as its OWN short sentence (the base already carries geometry)
      const b = J([head, ld, cam, gear, fr]);
      return isStatic ? `${b}. The camera holds static.` : `${b}. The camera ${ADVERB[n.speed]} ${mv.verb}.`;
    }
    case "luma": {
      // EXACT-STRING + STACKABLE: append literal camera string(s).
      const base = J([head, ld, cam, gear, fr]);
      const moves = [n.move, ...(n.extraMoves || [])];
      if (isStatic && moves.length === 1) return `${base}, static camera`;
      const strs = moves.map((m) => MOVE_STRINGS[m].luma);
      let camMoves = `camera ${strs[0]}`;
      for (let i = 1; i < strs.length; i++) camMoves += `, combine ${strs[i - 1]} with ${strs[i]}`;
      return `${base}, ${camMoves}`;
    }
    case "hailuo": {
      // BRACKET-TOKEN: end with [Token]s, max 3 combined.
      const base = J([head, ld, cam, gear, fr]);
      if (isStatic) return base;
      const toks = [n.move, ...(n.extraMoves || [])]
        .map((m) => MOVE_STRINGS[m].bracket)
        .filter(Boolean)
        .slice(0, 3);
      return `${base} ${toks.map((t) => `[${t}]`).join(" ")}`;
    }
    case "ltx": {
      // LTX Studio / LTX-2 (Lightricks): flowing PRESENT-TENSE prose (like veo), and
      // the camera move is its OWN sentence with a pace word + an END-STATE
      // ("settling on the …") — LTX's single biggest coherence lever per its prompt
      // guide (ltx.io/model, film.fun). Reuses ADVERB + MOVE_STRINGS.verb.
      const b = J([head, ld, cam, gear, fr]);
      if (isStatic) return `${cap(b)}. The camera holds static.`;
      return `${cap(b)}. The camera ${ADVERB[n.speed]} ${mv.verb}, settling on the ${n.size}.`;
    }
    case "pika":
    case "higgsfield":
    case "wan":
    case "seedance":
    default:
      // Every sentence-style platform (present + future) inherits the same skin.
      return isStatic ? J([head, ld, cam, gear, fr, "static camera"]) : J([head, ld, cam, gear, `${n.speed} ${mv.phrase}`, fr]);
  }
}

// One block per shot (each shot on its own — ONE move per shot is respected).
export function encodeScene(scene: EditorScene, platformId: PlatformId, meta: ProjectMeta = {}, o: ShotOptions = ALL_ON): string {
  return scene.frames
    .map((f, i) => `# ${f.name || `Shot ${i + 1}`}\n${encodeShot(toNeutral(f, meta), platformId, o)}`)
    .join("\n\n");
}

// Whole project -> multi-shot output, one block per shot across all scenes.
export function encodeProject(project: EditorProject, platformId: PlatformId, o: ShotOptions = ALL_ON): string {
  const meta: ProjectMeta = {
    aspectRatio: project.settings?.aspectRatio,
    camera: project.settings?.camera,
    globalCamera: project.settings?.globalCamera,
  };
  return project.scenes.map((sc) => encodeScene(sc, platformId, meta, o)).join("\n\n");
}
