# framepilot — ponytail-audit merged cut-list

Merged from three audit passes (3D-engine dedupe / DRY / rr-compliance) into one
ranked cut-list. Format per finding: `<tag> <what>. <replacement>. [path] ~<lines>`.
Groups are ordered biggest-net-cut first; findings within each group are ranked
biggest cut first. Overlapping findings deduped (see notes).

---

## Theme 1 — rr-compliance (net ~-260 src, + optional -8,259)

`delete:` project/ ships 8,259 tracked lines of concept/reference (_ds_bundle.js 3665, support.js 1703, .dc.html mockups, cag-viewport.js) that src never imports — Three.js loads via `import("three")` from node_modules, not project/. Move reference out of the app repo. *(Conditional — reference material; your call.)* [project/] ~-8259
`dup:` 134 inline `style={{…}}` blocks in dataprompt/ + GlobalModals with NO css file, while the editor half is fully class-driven via editor.css. Hoist to a `dataprompt.css` mirroring editor.css (SSOT for its screen). [src/components/dataprompt/*, src/components/shell/GlobalModals.tsx:11] ~-200
`shrink:` AppState.tsx 763 LOC monolith, never decomposed the way EditorState was (a 431-line thin composition over state/editor/*). Mirror it: state/data/* action-group hooks. [src/state/AppState.tsx:1] (line-neutral reorg)
`shrink:` editor.css 1596 LOC single sheet. Split by section (shell/panel/viewport/outline) so each stays under the 200 rr ceiling. [src/components/editor/editor.css:1] (line-neutral reorg)
`shrink:` GlobalModals.tsx bundles 5 dialogs (ImportModal alone 216 LOC) + Toast in 550 LOC. Split into shell/modals/{Import,Schema,Apply,Edit,View3d}Modal.tsx. [src/components/shell/GlobalModals.tsx:46] (line-neutral reorg)
`dup:` dead token fallbacks re-hardcode the SSOT value: `var(--highlight, #EFD4AC)` in NavItem + Badge (token at globals.css:33,126), `var(--primary, #D97757)` in editor.css:20. Drop the literal → `var(--highlight)`. [src/components/ds/NavItem.tsx:166, src/components/ds/Badge.tsx:33] ~-3
`native:` internal-route nav done via `useRouter().push(m.href)` on a NavItem button (+ StubScreen `router.push("/")`). Use next/Link for prefetch + real anchor a11y. [src/components/shell/Sidebar.tsx:136, src/components/StubScreen.tsx:91]
`shrink:` Modal.tsx backdrop hardcodes `rgba(20,20,18,.5)`; no scrim token in globals. Add `--overlay` to globals SSOT, reference it. [src/components/ds/Modal.tsx:20]
`delete:` stale comments claim a raw `.ico <button>`/`.on` swap is still pending — already migrated to ds/Button. Trim the misleading lines. [src/components/editor/panel/outline/IcoButton.tsx:6, src/components/editor/panel/control/ToggleRow.tsx:4] ~-4
`yagni:` casing/naming drift — lib file `dataPrompt.ts` (camelCase) vs component dir `dataprompt/` (lowercase); routes mix Indonesian (beranda/panduan/proyek) with English (editor/library; `/template` redirects to `/library`). Pick one per axis. [src/lib/dataPrompt.ts]

> **Backend has since landed** — `convex/` now exists (schema.ts, projects.ts, auth.ts, http.ts, lib.ts). The rr Convex rules below are no longer "forward-looking"; they are now live audit criteria — grep and enforce:
> validators (`args` + `returns v.*`) on every public query/mutation/action; `requireUser()`/`requireAdmin()` as first line of every public fn before any read/write; no bare `.collect()` (bound with `.take(n)`/paginate); every filtered query index-backed via `.withIndex` (no `.filter` scans); throw `ConvexError({ code })` not bare `Error`/string; keep `"use node"` action files separate from query/mutation files; snake_case convex/ paths (no hyphens).

## Theme 2 — DRY / complexity (net -190)

`shrink:` EditorState.tsx `useMemo` value has an ~80-line dep array listing every action; all are stable useCallbacks/refs so it reduces to `[version]` (only fresh-snapshot trigger) + one eslint-disable. Collapse it. [src/state/EditorState.tsx:347] ~-80
`dup:` scene-walk "find frame by id" (`for (const sc of scenes) { sc.frames.find/findIndex(x=>x.id===id) }`) copy-pasted 7× (brief.currentFrame + frames.ts loadFrame/dupFrame/delFrame/moveFrame/renameFrame/setFrameNotes). Add `findFrame(project,id) → {scene,frame,index}` in editorModel. [src/state/editor/frames.ts:88] ~-25
`dup:` whole-project swap block — `projectRef=X; currentFrameIdRef=null; historyRef=reset; engine.setAspect/updateHud; commitHistory; bump` — repeated 4× (io newProjectAction/loadSavedProject/importProjectObject + EditorState autosave hydrate). Extract `swapProject(project,label)`. [src/state/editor/io.ts:70] ~-20
`dup:` `{ ...defaultShotMeta(), ...(f.meta||{}) }` meta-hydrate idiom appears ~7× (editorPrompt.framePrompt, editorExport.exportCSV + storyboard, frames.captureFrameFields, frames.loadFrame, playback.gotoFrameIndex, brief.frameIsDirty). Add `metaWithDefaults(meta)`. [src/lib/editorPrompt.ts:43] ~-12
`dup:` two identical arm-then-confirm-in-2600ms widgets: `ArmDelete` (raw button) and `ArmDeleteButton` (IcoButton). Same useState+timer+cleanup. Have SavedProjects reuse `ArmDeleteButton` (or a shared `useArmedConfirm` hook). [src/components/editor/panel/SavedProjects.tsx:23] ~-15
`delete:` `toAppProject` + `toAppProjectNow` reverse-converter is dead — no component calls `ctx.toAppProjectNow`, and `toAppProject` has no other caller. Drop function + type + memo entry. [src/lib/editorModel.ts:300] ~-12
`dup:` shot-count reduce `scenes.reduce((n,s)=>n+s.frames.length,0)` (3×: EditorHeaderBar, OutlineTree, SavedProjects) and sceneDuration-sum reduce (4×: EditorHeaderBar, OutlineTree, editorExport). Add `countFrames(p)` / `projectDuration(p)` to editorModel. [src/components/editor/EditorHeaderBar.tsx:16] ~-10
`delete:` `quotaWarn` is dead plumbing — `quotaWarnRef` is written twice (core.pushAutosave, io.saveCurrentProject) but never read, and `ctx.quotaWarn` has no consumer. Remove field + ref + writes. [src/state/editor/types.ts:55] ~-8
`dup:` scene `<select>` (options mapped to `{name} ({n}f)`) duplicated in FramesSection and PreviewPanel. Extract a `<SceneSelect/>`. [src/components/editor/PreviewPanel.tsx:65] ~-8
`dup:` PreviewPanel ships its own `fallbackCopy` + navigator.clipboard branching that verbatim duplicates clipboard.ts `copyText`. Import `copyText`, keep only the "copied ✓" timeout. [src/components/editor/PreviewPanel.tsx:15] ~-8
`dup:` history-reset object literal `{ entries: [], index: -1, busy: false, max: 30 }` written 5× (core, io ×3, EditorState). Add `newHistoryState()`. [src/state/editor/core.ts:66] ~-6
`dup:` transport indicator "cur/total · name" computed identically in FramesSection and PreviewPanel. Extract `playbackIndicator(frames, idx)`. [src/components/editor/FramesSection.tsx:23] ~-5
`shrink:` the view id order `["cam","top","left","right","iso"]` re-listed 4× (EditorViewport VIEW_META + its forEach, EditorTabBar VIEWS, EditorState VIEW_KEYS). Derive from one `VIEW_IDS` const. [src/components/editor/viewport/EditorViewport.tsx:16] ~-4
`dup:` settings literal `{ aspectRatio:"16:9", fps:24, sensor:"Full Frame" }` duplicated in dataPrompt.entryProject and dataPrompt.schemaObj (mirrors editorModel.defaultProjectSettings). Hoist a `DEFAULT_SETTINGS` const in dataPrompt. [src/lib/dataPrompt.ts:389] ~-4
`shrink:` `importFromLibrary` only forwards to `importProjectObject`. SavedProjects can call `ctx.importProjectObject(libraryProject)` directly. Drop the wrapper + type + memo entry. [src/state/editor/io.ts:124] ~-4
`shrink:` FramesSection reimplements `activeScene()` inline (`scenes.find(s=>s.id===activeSceneId) ?? scenes[0]`); PreviewPanel already uses the helper. Use `activeScene(project)`. [src/components/editor/FramesSection.tsx:19] ~-3
`shrink:` `markDirty` is a bare alias of `bump` (`useCallback(()=>{bump()},[bump])`), used only in rig.ts. Delete it, call `bump` in rig.ts. [src/state/editor/core.ts:93] ~-3
`shrink:` `ctx.version` field is never read by any consumer — `version` only needs to be the memo dep. Drop it from the value object + type. [src/state/editor/types.ts:47] ~-2
`delete:` `synth` is imported into editorModel only to be re-exported (`export { synth }`); no file imports it from editorModel. Drop the import + re-export. [src/lib/editorModel.ts:327] ~-2

## Theme 3 — 3D-engine dedupe (net -63; new scene-kit.ts ~+85, ~-148 across both engines)

Both engines are the two Three.js controllers; each dup lives in both files, cited `[editorViewportEngine.ts:LINE + CagViewport.tsx:LINE]`.

`dup:` makePerson leg/torso/arm/neck/head/nose geometry is byte-identical in both engines (only the editor adds a `hair` mesh). Extract `buildPerson(T, mat, {hair})` to scene-kit.ts; editor `makePerson()` and CagViewport `_buildSubject` person-branch both call it. [editorViewportEngine.ts:312 + CagViewport.tsx:168] ~-21
`dup:` the `rgb`/`_rgb` DS-token sampler (1x1-canvas fillStyle→getImageData trick) is copy-pasted; only the source element differs (`this.canvas` vs `this.host`). Extract `sampleToken(el, name, fb)` to scene-kit.ts; leave a 3-line wrapper in each class. [editorViewportEngine.ts:163 + CagViewport.tsx:69] ~-15
`dup:` makeObject base/column/cap/art (same CylinderGeometry/TorusKnot params + y-positions) is verbatim in both. Extract `buildObject(T, mat)` to scene-kit.ts. [editorViewportEngine.ts:346 + CagViewport.tsx:156] ~-8
`stdlib:` CagViewport hand-rolls spherical→cartesian camPos (`sin(azR)*cos(elR)*dist…`), the view-orbit variant, `D2R`, and `vfovR = 2*atan(24/(2*lens))` — all already exported by editorMath (`setOrbit`, `deg2rad`, `fovFromFocal`) which the editor already imports. Import them into CagViewport instead. [CagViewport.tsx:209,219,328] ~-6
`stdlib:` editor re-inlines `lerp`/`lerpAngle` + inlines smoothstep `e=t*t*(3-2*t)`; editorMath already exports all three (its `smoothstep` is otherwise dead code — see dedupe note). Import them, drop the local copies. [editorViewportEngine.ts:1151,974 + src/lib/editorMath.ts:26] ~-6
`dup:` camera gizmo group (`BoxGeometry(0.22,0.18,0.3)` body + `CylinderGeometry(0.06,0.06,0.14,12)` lens, `rotation.x=PI/2`, `position.z=-0.2`) is identical. Extract `buildCameraGizmo(T, color)` to scene-kit.ts. [editorViewportEngine.ts:273 + CagViewport.tsx:246] ~-4
`dup:` the accent facing-cone (`ConeGeometry(0.08,0.25,4)`, `rot.x=PI/2`, `pos(0,0.02,0.55)`) and target dot (`SphereGeometry(0.07,…)` in `--primary`) are duplicated. Extract `buildFacingCone(T,color)` + `buildTargetDot(T,color)` to scene-kit.ts. [editorViewportEngine.ts:250,283 + CagViewport.tsx:149,258] ~-3
`caveat:` the frustum is NOT a true code-dup — CagViewport draws it as manual `LineSegments` (CagViewport.tsx:262) while the editor uses `THREE.CameraHelper` (editorViewportEngine.ts:260). Same concept, divergent impls; no clean shared-module cut without rewriting one. 0 lines claimed here rather than overstate.

---

## Dedupe notes

- **smoothstep** appeared in two passes: engine "editor inlines its own smoothstep, import editorMath's" (Theme 3) and DRY "editorMath.smoothstep is exported-but-unused" (Theme 2). These are one problem with one fix — the engine importing editorMath's `smoothstep` drops the inline copy AND makes the exported one live. Merged into the single Theme-3 `stdlib:` finding above (~2-line overlap already netted out).
- **project/ 8,259 lines** — verified against the tree (`git ls-files project/` → 8259 total). Kept as the single biggest, conditional cut.

## net: -513 lines possible in src

- rr-compliance ~-260 (inline-style→CSS dedup dominates; the three "split" items are line-neutral reorgs that buy the <200-LOC rr ceiling)
- DRY / complexity ~-190
- 3D-engine dedupe ~-63 (net of the new ~85-line scene-kit.ts)
- (smoothstep overlap already deduped, ~2 lines)

**+ optional -8,259** if the `project/` reference material is dropped from the app repo → up to **~-8,772 total**.

## TOP 3 fixes to apply now (safe + high value)

1. **Dead-code sweep** (pure deletions, zero behavior change): `toAppProject`/`toAppProjectNow`, `quotaWarn` field+ref+writes, `synth` import+re-export, `importFromLibrary` wrapper, `markDirty` alias, `ctx.version` field, and the engine→editorMath `smoothstep` merge. All unreferenced or trivially forwarding — ~-40 lines with no risk. [editorModel.ts, types.ts, io.ts, core.ts, editorMath.ts]
2. **rr SSOT trim** (trivial, no runtime risk): drop dead token fallbacks `var(--highlight, #EFD4AC)` / `var(--primary, #D97757)` → bare `var(--highlight)`/`var(--primary)`, and delete the stale "swap still pending" comments in IcoButton/ToggleRow (already migrated). ~-7 lines. [ds/NavItem.tsx:166, ds/Badge.tsx:33, editor.css:20, IcoButton.tsx:6, ToggleRow.tsx:4]
3. **Collapse EditorState.tsx memo dep array** to `[version]` + one eslint-disable — every listed dep is a stable useCallback/ref, so the ~80-line array is noise. Single mechanical change, ~-80 lines, biggest safe individual cut in src. [src/state/EditorState.tsx:347]
