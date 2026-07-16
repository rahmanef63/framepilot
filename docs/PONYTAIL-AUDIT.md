# framepilot — ponytail-audit cut-list (2026-07-16)

Repo-wide lazy-senior scan of the **live** tree (8 disjoint partitions, every
finding grep-verified by a second adversarial pass — default REJECT if the
symbol has any live caller). Supersedes the pre-refactor audit that used to live
here (it cited `project/`, `AppState.tsx` 763 LOC, `editorModel.ts` single file —
all gone). Format: `tag: what. replacement. [path] ~lines`. Ranked biggest cut
first. **Lists only — nothing applied.**

---

## Tier 1 — dead docs (net -164)

- `delete:` **IMPLEMENTATION.md** — stale, 0 inbound refs, its two content links point at `project/` and `chats/` dirs that no longer exist; README.md is canonical. `[IMPLEMENTATION.md]` ~-83
- `delete:` the **old stale audit** that used to be this file (pre-refactor tree). *Realized by this rewrite.* Only inbound ref was `README.md:211` tree listing (still valid — file kept, content fresh). `[docs/PONYTAIL-AUDIT.md]` ~-81

## Tier 2 — duplicate UI shells (net -136)

- `shrink:` **MobileSceneMenu ≡ MobileFrameMenu** — byte-for-byte identical long-press menu (scrim, clamp, inline-rename form, 2-tap arm-delete) except which `ctx.*` each row calls + the frame's one extra "update camera" row. Merge into one `MobileItemMenu({head,aria,actions,extraRows?})`. Both imported only by MobileFrameStrip. `[src/components/editor/MobileSceneMenu.tsx + MobileFrameMenu.tsx]` ~-55
- `shrink:` **two byte-identical route error boundaries** (`(app)/error.tsx` ≡ `docs/error.tsx`, differ only by i18n keys + console tag). One shared `ErrorBoundaryCard`; each `error.tsx` stays as a ~10-line default-export wrapper (Next requires one per segment). `[src/app/(app)/error.tsx + src/app/docs/error.tsx]` ~-34
- `shrink:` **popover isolation + dismiss effect duplicated across both viewport menus** (pointerdown/wheel stopPropagation + outside-click/Esc close). One `useDismissablePopover(open,rootRef,popRef,onClose)`. `[ViewportCameraMenu.tsx:39 + CellViewMenu.tsx:62]` ~-20
- `shrink:` **icon-chip span reimplemented inline** (bordered square, grid place-items, mono font) — 3 cited copies + a 4th at EditorActionMenu:206, differ only by 24/26px size. One `<IconChip>`/shared CSSProperties in ds. `[NavItem.tsx:64 · CreateMenu.tsx:156 · NavUserMenu.tsx:211]` ~-20
- `shrink:` **outside-click + Esc dismiss effect triplicated across dropdowns** (same wrapRef.contains + keydown Escape + getBoundingClientRect toggle). One `useDismiss(ref,open,setOpen)`. `[LanguageSwitcher.tsx:25 · CreateMenu.tsx:39 · NavUserMenu.tsx:45]` ~-17

## Tier 3 — dead engine plumbing (net -25)

- `delete:` **three dead public engine seams** `resize()` / `stepReset()` / `getCellView()` — grep = 0 callers (registerEngine fans out every other handle.* but never these; ResizeObserver writes `lastW` directly). Remove bodies + EditorEngineHandle interface entries. `[editorViewportEngine.ts:373,507,1068 + engineApi.ts:59,85,97]` ~-18
- `delete:` **write-only `thirdsOn` field + no-op `setThirds` seam** — engine field written L122/L487, never read (overlay is React-driven from `ui.thirdsOn` in Hud). Drop field+method+interface line+2 handle.setThirds calls. `[editorViewportEngine.ts:122,486 + engineApi.ts:79]` ~-7

## Tier 4 — DRY collapses in state/logic (net -66)

- `yagni:` **`importFromLibrary`** only delegates to `importProjectObject` (which already takes `unknown`). Retarget its 1 caller (SavedProjects:86), drop wrapper+type+wiring+2 dead imports. `[src/state/editor/io.ts:116]` ~-13
- `shrink:` **twin long-press pointer-down handlers** `onDown`/`onSceneDown` byte-identical except final `setMenu` vs `setSceneMenu`. One `armLongPress(e,rect,onFire)`. `[MobileFrameStrip.tsx:50-69]` ~-10
- `shrink:` **preset/user snapshot-fields block** computed identically in both entry maps (frameCount reduce, f0 first-frame p-fields, frames flatMap). One `snapshotFields(scenes)`. `[src/state/AppState.tsx:84-152]` ~-8
- `shrink:` **"seed engine views" block** (setSavedViews + per-slot setCellView over top/left/right) triplicated; `syncEngineViews` has 1 caller. One `seedEngineViews(engine,project)`. `[EditorState.tsx:267 · io.ts:41 · views.ts:31]` ~-7
- `delete:` **unused i18n exports** `getActiveLocale` (runtime.ts) + `useLocale` (I18nProvider) — 0 call sites (setActiveLocale IS used; its getter twin isn't). `[i18n/runtime.ts:12 + I18nProvider.tsx:85]` ~-7
- `shrink:` **`angleEN` local map** byte-identical to exported `ANGLE_EN`; editorPrompt already imports from `./prompt/platforms`. Import ANGLE_EN, delete local. `[src/lib/editorPrompt.ts:39]` ~-7
- `shrink:` **local `lerp`/`lerpAngle`** re-declared in the engine, identical to `editorMath` exports (already imports smoothstep/norm180 from there; module import has zero per-call cost). `[editorViewportEngine.ts:1291]` ~-6
- `shrink:` **copy-then-flip-1200ms** hand-rolled in 3 files (setCopied + copyText + timeout + "Tersalin ✓" ternary). One `useCopyFlip()`. `[CameraPromptDock.tsx:31 · PreviewPanel.tsx:30 · CopyButton.tsx:33]` ~-5
- `delete:` **`refreshLocal` seam** threaded store→AppState→io — redundant: `persistEntry`→`PROJECTS_CHANGED` already re-reads via the store's own listener. `[src/state/app/useLibraryIo.ts:87]` ~-4
- `shrink:` **playback frame-indicator** `cur/total · name` computed verbatim in 2 sites. One `frameIndicator(frames,idx)`. `[PreviewPanel.tsx:40 + OutlineSidebar.tsx:41]` ~-2

## Tier 5 — platform + one-liners (net -28, -1 dep)

- `native:` **two `<a onClick={preventDefault; router.push("/")}>`** hand-roll client nav. Use `next/Link` (renders the `<a href>` + does the pushState; also handles modifier-click). `[Sidebar.tsx:66,164]` ~-7
- `shrink:` **admin-email check** duplicated across `requireAdmin` and `isAdminUser` (both do getAuthUserId→db.get→email→adminEmails().includes). requireAdmin reuses isAdminUser. `[convex/lib.ts:31]` ~-4
- `delete:` **unused `uid` import** — `import { Entry, seed, uid }` but uid never referenced. `[src/state/app/useLibraryStore.ts:10]` ~-1
- `delete:` **`@auth/core` direct dependency** — 0 direct imports; installed transitively by `@convex-dev/auth`. `[package.json]` ~-1, **-1 dep**
- `delete:` **`tsconfig` exclude `"project"`** — dead flag, the dir is gone. `[tsconfig.json]` ~-1

**net: -419 lines, -1 dep possible.**

> `playwright` devDep is also import-less, but it is a deliberate **local-only**
> line kept out of every commit (never staged) — already effectively absent from
> the tracked tree, so no action.

---

## Rejected (verified NOT worth cutting)

- ~~scene-by-id `.find` walk repeated 5×~~ — every site is already a single-line `.find`; a `findScene` helper adds ~4 lines net (+1 import), zero savings. DRY-only.
- ~~engine rig-pull one-liner in 2 sites~~ — a shared `pullRig()` replaces 2 one-liners with a 3-line def + 2 imports = net +lines.

## Not in scope (route to a normal review, not this audit)

Correctness / security / validator gaps in `convex/`, perf, a11y — the audit
lens here is complexity/dead-weight only.
