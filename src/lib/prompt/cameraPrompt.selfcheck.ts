// cameraPrompt.selfcheck.ts — one runnable, framework-free assertion demo.
// Proves the SAME camera intent (low-angle, medium close-up, dolly-in) renders
// DIFFERENTLY per platform. Call runSelfCheck() from a script/REPL; throws on
// failure. NO test framework, NO node imports.

import { RawFrame } from "../dataPrompt";
import { encodeShot, toNeutral } from "./cameraPrompt";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error("cameraPrompt selfcheck FAILED: " + msg);
}

export interface SelfCheckResult {
  runway: string;
  luma: string;
  hailuo: string;
}

export function runSelfCheck(): SelfCheckResult {
  // A low-angle medium close-up dolly-in shot (dolly-in => speed "slow").
  const frame = {
    name: "Hero",
    angle: "LOW ANGLE",
    shot: "MEDIUM CLOSE-UP",
    lens: 35,
    subj: "person",
    meta: { movement: "Dolly in" },
  } as unknown as RawFrame;

  const neutral = toNeutral(frame);
  assert(neutral.move === "dolly-in", `move should be dolly-in, got ${neutral.move}`);
  assert(neutral.speed === "slow", `speed should be slow, got ${neutral.speed}`);

  const runway = encodeShot(neutral, "runway");
  const luma = encodeShot(neutral, "luma");
  const hailuo = encodeShot(neutral, "hailuo");

  // runway: natural sentence carrying the slow push-in.
  assert(runway.includes("slow push-in"), `runway missing "slow push-in": ${runway}`);
  // luma: exact-string style — ends with the literal camera string.
  assert(luma.endsWith("camera push in"), `luma should end "camera push in": ${luma}`);
  // hailuo: bracket-token style — ends with the [Push in] token.
  assert(hailuo.endsWith("[Push in]"), `hailuo should end "[Push in]": ${hailuo}`);
  // The three must be materially different renderings.
  assert(runway !== luma && luma !== hailuo && runway !== hailuo, "renders not distinct");

  return { runway, luma, hailuo };
}
