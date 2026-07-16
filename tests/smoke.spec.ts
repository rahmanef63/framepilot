import { test, expect, type Page } from "@playwright/test";

// Smoke test — the committed CI safety-net (issue #1). It boots the STANDALONE
// PROD build (see playwright.config.ts) and, for each core route, asserts:
//   1. the page navigates and paints a stable, structural landmark,
//   2. the <body> is visible and has real content,
//   3. NO uncaught pageerror and NO real console "error" fired during load.
//
// It deliberately does NOT use waitUntil:"networkidle" — the Convex realtime
// client holds a WebSocket open for the lifetime of the page, so the network
// never goes idle and networkidle would always time out. We wait on a concrete
// DOM landmark instead.

// route → a structural selector that is present once the route has rendered.
// Kept intentionally robust (layout-level containers / semantic landmarks), not
// text- or copy-dependent, so translations and content edits don't break smoke.
const ROUTES: { path: string; ready: string }[] = [
  { path: "/", ready: ".cag-editor:not(.fp-outline-portal)" }, // the 3D editor shell IS the home page (exclude the hidden sidebar-portal clone)
  { path: "/library", ready: ".app-shell" }, // DataPrompt library inside the app Shell
  { path: "/docs", ready: "main" }, // /docs has its own layout with a <main> landmark
  { path: "/panduan", ready: ".app-shell" }, // camera-grammar guide inside the app Shell
];

// Known-benign console/page noise we must NOT fail on. These are environmental
// (dev/prod parity, offline Convex, missing favicon in the standalone copy,
// React hydration diffs from client-only localStorage theme/lang), not app bugs.
const BENIGN = [
  /convex/i,
  /websocket|ws:\/\/|wss:\/\//i,
  /failed to load resource/i,
  /favicon/i,
  // Hydration mismatch warnings caused by the anti-FOUC theme/lang script that
  // reads localStorage before hydration — expected, not a real error.
  /hydrat/i,
  /did not match|server rendered|text content does not match/i,
  /localStorage|theme|lang/i,
];

function isBenign(text: string): boolean {
  return BENIGN.some((re) => re.test(text));
}

// Attach error collectors BEFORE navigation so nothing is missed. Returns a
// getter for the real (non-benign) errors accumulated so far.
function collectErrors(page: Page): () => string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => {
    const msg = `${err.name}: ${err.message}`;
    if (!isBenign(msg)) errors.push(`[pageerror] ${msg}`);
  });
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (!isBenign(text)) errors.push(`[console.error] ${text}`);
  });
  return () => errors;
}

for (const route of ROUTES) {
  test(`smoke: ${route.path} renders without errors`, async ({ page }) => {
    const getErrors = collectErrors(page);

    const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(res, `no HTTP response for ${route.path}`).not.toBeNull();
    expect(res!.status(), `bad HTTP status for ${route.path}`).toBeLessThan(400);

    // Wait for a stable, structural landmark for this route.
    await page.waitForSelector(route.ready, { state: "visible", timeout: 30_000 });

    // The <body> is visible and actually has content (not a blank error page).
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const textLen = await body.evaluate((el) => (el.textContent || "").trim().length);
    expect(textLen, `${route.path} rendered an empty body`).toBeGreaterThan(0);

    // Give any late-firing microtask errors a beat to surface, then assert clean.
    await page.waitForTimeout(500);
    const errors = getErrors();
    expect(errors, `real errors on ${route.path}:\n${errors.join("\n")}`).toEqual([]);
  });
}

// Mobile-only: the editor root actually renders on a phone viewport AND the page
// does not overflow horizontally (a classic mobile-layout regression).
test("smoke: mobile / has editor root and no horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only assertion");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".cag-editor:not(.fp-outline-portal)", { state: "visible", timeout: 30_000 });

  const overflow = await page.evaluate(() => {
    const el = document.scrollingElement || document.documentElement;
    return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
  });
  // +2px slack for sub-pixel rounding / scrollbar gutter.
  expect(
    overflow.scrollWidth,
    `horizontal overflow on mobile /: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 2);
});
