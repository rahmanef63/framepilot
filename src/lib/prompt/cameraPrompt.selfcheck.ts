// cameraPrompt.selfcheck.ts — one runnable, framework-free assertion demo.
// Proves the SAME camera intent renders DIFFERENTLY per platform AND that the
// real 3D camera geometry (elevation + azimuth-view + distance + height + dutch)
// survives into EVERY skin. Call runSelfCheck() from a script/REPL; throws on
// failure. NO test framework, NO node imports.

import { RawFrame } from "../dataPrompt";
import { encodeShot, toNeutral } from "./cameraPrompt";
import { ALL_ON } from "./types";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error("cameraPrompt selfcheck FAILED: " + msg);
}

export interface SelfCheckResult {
  runway: string;
  luma: string;
  hailuo: string;
  runwayStatic: string;
}

export function runSelfCheck(): SelfCheckResult {
  // A high-angle (el 20), dutch (roll 12), three-quarter-front (az 35) medium
  // close-up dolly-in — carries full geometry so every skin must echo it.
  const frame = {
    name: "Hero",
    angle: "HIGH ANGLE",
    shot: "MEDIUM CLOSE-UP",
    lens: 35,
    az: 35,
    el: 20,
    dist: 3,
    roll: 12,
    fov: 40,
    subj: "person",
    meta: { movement: "Dolly in" },
  } as unknown as RawFrame;

  const neutral = toNeutral(frame);
  assert(neutral.move === "dolly-in", `move should be dolly-in, got ${neutral.move}`);
  assert(neutral.speed === "slow", `speed should be slow, got ${neutral.speed}`);

  const runway = encodeShot(neutral, "runway");
  const luma = encodeShot(neutral, "luma");
  const hailuo = encodeShot(neutral, "hailuo");

  // The real camera geometry must appear in EVERY skin, regardless of idiom.
  for (const [id, out] of [["runway", runway], ["luma", luma], ["hailuo", hailuo]] as const) {
    assert(out.includes("looking down"), `${id} missing elevation "looking down": ${out}`);
    assert(out.includes("from subject"), `${id} missing distance "from subject": ${out}`);
    assert(out.includes("dutch tilt"), `${id} missing "dutch tilt": ${out}`);
    assert(out.includes("three-quarter"), `${id} missing view "three-quarter": ${out}`);
  }

  // The three must be materially different renderings.
  assert(runway !== luma && luma !== hailuo && runway !== hailuo, "renders not distinct");

  // A STATIC / locked-off shot must STILL carry the distance + height geometry.
  const staticFrame = { ...frame, meta: { movement: "Static / Locked-off" } } as unknown as RawFrame;
  const runwayStatic = encodeShot(toNeutral(staticFrame), "runway");
  assert(runwayStatic.includes("m from subject"), `static missing distance: ${runwayStatic}`);
  assert(runwayStatic.includes("m high"), `static missing height: ${runwayStatic}`);

  // ShotOptions: unchecking a clause DROPS exactly that clause (live-toggle behaviour).
  const noLens = encodeShot(neutral, "runway", { ...ALL_ON, lens: false });
  assert(!noLens.includes("35mm"), `lens toggle off must drop the lens: ${noLens}`);
  assert(noLens.includes("looking down"), `lens toggle off must keep the rest: ${noLens}`);

  const noGeom = encodeShot(neutral, "runway", {
    ...ALL_ON,
    elevation: false,
    view: false,
    distance: false,
    height: false,
    dutch: false,
  });
  assert(!noGeom.includes("looking down"), `geometry off must drop elevation: ${noGeom}`);
  assert(!noGeom.includes("from subject"), `geometry off must drop distance: ${noGeom}`);
  assert(noGeom.includes("push-in"), `geometry off must keep the move: ${noGeom}`);

  const noMove = encodeShot(neutral, "hailuo", { ...ALL_ON, move: false });
  assert(!noMove.includes("[") && !noMove.includes("Push"), `move toggle off must drop the bracket token: ${noMove}`);

  return { runway, luma, hailuo, runwayStatic };
}
