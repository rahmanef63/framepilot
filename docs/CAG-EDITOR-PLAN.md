# CAG Editor — Implementation Plan

**Target:** Implement the full `concept/camera-angle-guides-pro.html` prototype as real Next.js 15 + React 19 + TypeScript + Three.js features, **built on top of the existing FramePilot app** — reusing `AppState`, the Rupa design tokens, the `ds/*` primitives, the shell + routing, `dataPrompt.ts`, and `CagViewport`. Port the concept's working logic/math/values faithfully; reuse before rebuild; no speculative abstractions.

**Concept reference (read-only):** `/home/rahman/projects/framepilot/concept/camera-angle-guides-pro.html`
**Existing engine twin:** `/home/rahman/projects/framepilot/project/cag-viewport.js` → already ported to `src/components/CagViewport.tsx`

---

## 1. Product summary

FramePilot today ships **one screen** — the Data Prompt *library* (`/`, `DataPromptScreen`): a grid/table/split view of parsed cinematography *entries* (photo / YouTube / paste / file), each holding `{scenes:[{name,frames:RawFrame[]}]}`, with Import / Schema / Apply-to-project / Export-project / read-only 3D-preview (`View3dModal` → `CagViewport`) modals. It is a **read + apply** surface: you generate/parse camera data and stage it into a `project`.

The **CAG Editor** is the missing **authoring** surface: a full-screen 3D shot-planning studio (a new `/editor` route inside the same shell) where the user *directs* the rig — orbits/pans/flies the camera, poses the subject, dials angle/shot-size/lens, writes a per-shot brief, captures frames into scenes, scrubs playback, and exports JSON / CSV / prompt / storyboard. It reads and writes the **exact same `camera-angle-guide/v2` project JSON** the library already imports/exports, so the two screens are two ends of one pipeline:

```
 Library (/)                              Editor (/editor)
 parse source → entries → "Terapkan"  ──▶  hydrate EditorProject (v2)
                                            author rig + frames + briefs
 import/export v2 JSON  ◀──────────────▶   export/import v2 JSON  (lossless, same schema)
```

Relationship contract: the library stages loosely-typed `RawFrame` scenes; the editor owns the full v2 document and is the source of truth for camera *snapshots* (`s`), thumbnails, playback, and briefs. Handoff is **one-way on demand** (open editor → convert once, then editor autosaves its own doc), not a live two-way binding — avoids reactive-sync surprises.

---

## 2. Full feature inventory (25 groups)

Each item lists the exact behavior and the **load-bearing values/formulas/enums to preserve verbatim**. All are in the concept; ✅ = the value already exists in `src/lib/dataPrompt.ts` and must be reused, not re-declared.

### G1 · App tabs & routing
Three main tabs `editor | preview | guide`; `body[data-tab]` gates chrome (guide hides modebar/viewbar/hint). Editor default. `switchTab()` re-hosts the single WebGL canvas + rebuilds prompt on preview.

### G2 · 3D scene (see §5)
Renderer scissor-multi-viewport; `POV_BG=0x14181d`, `ORTHO_BG=0x101418`, `Fog(0x14181d, near16, far36)` (POV only), DPR cap 2, `setScissorTest(true)`. Lights: Hemisphere sky `0xbdd0e4`/ground `0x2a2320` @0.9, Key `0xffe0b0`@0.9 (4,6,3), Rim `0x88aaff`@0.35 (-5,4,-4). Ground: `GridHelper(20,20,0x3a4550,0x232a32)` + `CircleGeometry(10,48)` floor `0x1a2027` at y=-0.001. Person (`makePerson`, top≈1.72, nose at +z ⇒ front=+Z) and Object (`makeObject`, pedestal+torusknot, top≈1.45) exact part tables in concept §4/§5. Facing cone `0xf2a93b` at (0,0.02,0.55). Gizmos: `camHelper`(frustum, layer1), `camBody`(red box+lens, layer1), `targetDot`(`0xf2a93b`, layer1). **Layer discipline: povCam layer0 only; gizmos layer1; ortho cams layers 0+1.**

### G3 · Multi-view quad
Five cells `cam · top · left · right · iso` over one canvas. Viewbar order `QUAD · CAM · TOP · LEFT · RIGHT · ISO`. Focus/maximize via viewbar `[data-viewfocus]`, per-cell `.maxbtn[data-max]`, keys `1..5` + `Esc`. `iso` hidden in quad mode, shown only when focused. `applyFocus()` sets `#quad[data-focus]`, invalidates `lastW=-1`.

### G4 · Viewfinder HUD
Letterbox rect via CSS vars `--frame-top/left/width/height` computed from `outputAspect()`. `.corner` crop marks (24×24, exact `calc()` in styling digest §7). `.thirds` rule-of-thirds (`v1 33.33% v2 66.66% h1 33.33% h2 66.66%`, `.off`⇒opacity0). Badges: `.angleBadge`, `.shotBadge`, `.playBadge` (shown only `body.playing`). `.readout` telemetry bar. `.format-border` + `.formatLabel`. `.flash.go` shutter (reduced-motion guarded). Record dot `tally` blink 1s.

### G5 · Camera rig sliders (6)
`rAz` az 0–360 step1 def30 · `rEl` el -85–88 step1 def4 · `rDist` 0.4–20 step0.1 def3 · `rFov` 12–100 step1 def40 · `rRoll` -45–45 step1 def0 · `rTy` targetY 0.1–3 step0.05 def1.35. Rig model `{az,el,dist,fov,roll,targetY}`. az/el/dist are **derived** from `camPos` each read via `getOrbit()` and written back via `setOrbit()` (re-clamps).

### G6 · Subject controls
Seg `person | object`. Sliders `rSr` rotY -180–180 step5 · `rSx` x -6–6 step0.1 · `rSz` z -6–6 step0.1. When `trackSubject`, `rSx/rSz` also set `target.x/z=v`. `subjHeight()` = person `1.75` / object `1.4` (framing denominator). ✅ subject enum via concept, target.y set = person `1.35` / object `1.0` on switch.

### G7 · Angle presets (6) — ✅ mirror `ANGLES`
`[data-el,data-roll]`: Eye 0/0 · High 35/0 · Low -25/0 · Bird 80/0 · Worm -55/0 · Dutch 5/18. Handler keeps az&dist, sets `roll` + `setOrbit(az, el, dist)`.

### G8 · Shot-size presets (6) — CENTRAL
`[data-r]`: ECU 0.22 · CU 0.45 · MCU 0.75 · MS 1.15 · FS 1.8 · WS 3.0. Solve distance: `d = clamp((r·subjHeight())/(2·tan(fov/2)), 0.3, 30)`; keep az/el; `setOrbit(az,el,d)`. Inverse of `shotLabel()`.

### G9 · Lens presets (6)
`[data-mm]`: 18·24·35·50·85·135. `fov = clamp(fovFromFocal(mm), 12, 100)`.

### G10 · Lens/FOV math (sensor half-height **12**)
`focalLength() = round(12/tan(fov/2))`; `fovFromFocal(mm) = 2·atan(12/max(1,mm))°`. Equivalent to full-frame 36×24 vertical model `2·atan(24/(2·mm))` — **same model CagViewport uses** (`vfovR=2·atan(24/(2·lens))`). Keep consistent.

### G11 · Camera toggles
`Fokus Subjek` (F): `target.x/z=subjPos.x/z`, re-`setOrbit(az,el,dist)`. `Target Lock` (trackSubject bool, label OFF/ON). `Grid ⅓` (`thirdsOn`, def ON). `Frustum` (`frustumOn`→`camHelper.visible`, def ON). `Reset` = rig-only: subjPos(0,0), subjRot0, fov40, roll0, target.y=person?1.35:1.0, `setOrbit(30,4,3)`, ortho views reset (top ext4.5, left/right ext3.2 v1.1, iso ext4.2 v1.0), trackSubject false.

### G12 · Drag-tool modes + pointer interaction
`dragToolMode = nav | subject | camera`. Sensitivities (**preserve exactly**): cam orbit az `0.35`/px, el `0.3`/px; subject drag scale `dist·0.0022`; camera/pan scale `dist·0.0016`; wheel `dist·(1+deltaY·0.001)`. Right/middle button = pan (any mode). Ortho drag: `wpp=(2·ext)/rect.height`, per-view axis mapping (top/left/right/iso) in viewport digest §4. Wheel ortho: `ext·(1+deltaY·0.001)`. Clamps: `dist[0.3,30]`, `ext[0.8,30]`, `camPos.y[0.05,25]`, subject `±8`, `el[-85,88]`.

### G13 · Keyboard navigation
Guard `typing()` (INPUT/TEXTAREA/SELECT). Held-key `Set`. Fly WASD/Q(down)/E(up): `speed=(shift?8.5:2.4)·dt`, move both camPos+target (truck/dolly), y floor 0.07. Orbit arrows: `sp=(shift?150:70)·dt`, el at `0.7×`. Space=togglePlay, F=focus, Esc=quad, 1–5=view toggle, Ctrl/Cmd+Z / +Shift+Z / +Y = undo/redo. **Note: the hint says "Shift ×3.5" but the handler ratios are fly 8.5/2.4≈3.54 and orbit 150/70≈2.14 — preserve the actual handler numbers, not the label.**

### G14 · Shot classifiers + HUD readout
`angleLabel()` from `el`: `≥62 BIRD'S EYE · ≥16 HIGH · ≥-10 EYE LEVEL · ≥-40 LOW · else WORM'S EYE`; `+ " · DUTCH"` if `|roll|≥7`. `shotLabel()`: `span=2·dist·tan(fov/2)`, `r=span/subjHeight()`; thresholds `<0.3 ECU · <0.58 CU · <0.95 MCU · <1.45 MS · <2.2 FS · <3.6 WS · else EXTREME WIDE`. Readout: `AZ EL DIST LENS FOV ROLL H(camPos.y) SUBJ(ORANG/OBJEK) OUT(aspect·fpsFPS)`. Project stats `<b>N</b> scene · <b>N</b> shot · <b>Ns</b>`.

### G15 · Output frame
`aspectRatio ∈ {16:9,9:16,4:5,1:1,2.39:1}` ✅ `ARS`; `fps ∈ {24,25,30,60}` ✅ `FPS`; `sensor='Full Frame'`. Aspect drives **real camera aspect + letterbox**, not just guides. `aspectNumber("a:b")=a/b` fallback 16/9.

### G16 · Data Shot brief
Fields `intent · movement · action · lighting · style · audio` ✅ `Meta`/`DEF`. `movement` = 14-enum ✅ `MOVES`. Live `#shotSummary`; dirty tracking (`frameIsDirty` = `s` snapshot ≠ live + meta ≠ live). `duration`/`transition` come from the filmstrip playback controls, not this tab.

### G17 · Frame management
Frame = `{id,name:"Shot N",notes,thumb(jpeg dataURL q0.7 sized to aspect),angle,shot,lens,az:round,el:round,dist:+toFixed(1),s:snapState(),meta}`. `snapState()` = `{camPos,target,subjPos{x,z},fov,roll,subj,subjRot,trackSubject}`. Add / Update / Load / Dup (`+" (copy)"`, re-uid, deepCopy s+meta) / Del / Move / Rename / Notes. `frameSeq` = monotonic naming counter. Flash on add.

### G18 · Scene management
Scene = `{id,name,notes,frames,frameSeq:1,collapsed:false,notesOpen:false}`. Add / Switch (`setActiveScene(id,loadFirst)`) / Rename / Delete (double-click arm; auto-create Scene 1 if last) / Dup (re-uid every frame) / Reorder / Notes / Collapse. Scene selectors `#sceneSelect`+`#sceneSelect2` kept in sync.

### G19 · Outline tree
Scene→frame hierarchy; `.activeScene` highlight, collapse, per-scene actions (Play/Prompt/Note/Copy/↑↓/✕), inline rename (`.sname`/`.fname2`), per-frame rows (`.frow.current`). Lazy `renderTree()` on tab switch.

### G20 · Frames filmstrip + transport
Cards `flex:0 0 212px`, `.current` (amber ring) / `.dirty` (brown). Transport `[data-pb]` prev/play/next/stop + `.pbInd` `i/N · name`. Duration `rDur` 0.5–30 step0.5 def2 (`oDur` `N.Ns`). Loop toggle, Smooth toggle (def ON, label HALUS/CUT). Add / Update / Copy-scene-prompt.

### G21 · Playback engine
`playback={playing,idx,t,duration:2,loop:false,smooth:true}`. rAF `dt=min(0.05,clock.getDelta())`; `t += dt/frameDuration(frame)` where **`frameDuration(f)=max(0.1, f.meta.duration||2)` is per-frame, authoritative** (not `playback.duration`). Smoothstep ease `e=t·t·(3-2·t)`. `lerp` all numeric; `lerpAngle(a,b,t)=a+norm180(b-a)·t` for subjRot only; `subj` snaps discrete; `subjPos` has no y. Non-loop smooth holds/freezes on last frame; cut branch hard-applies. `body.playing` drives dot + playBadge.

### G22 · Persistence
Keys `AUTOKEY='camguide-pro-autosave'`, `LISTKEY='camguide-pro-projects'`, `OLDKEY='camguide-pro-scenes'`. Backend `window.storage → localStorage → in-memory`. Save project, saved list render, debounced autosave, New Project (destructive, no confirm).

### G23 · Export / Import
JSON (whole v2 verbatim ✅ `exportProject` shape), CSV shot list (**25 cols, exact order** in export digest §5; BOM + CRLF + quote-doubling), Prompt TXT (`projectPrompt()`), Storyboard PNG (canvas 1600w, 4 cols, cardH286, exact layout in digest §5). Import JSON: `ensureProjectShape`; **v1 legacy** (`data.frames[]`) wraps as single scene.

### G24 · Prompt generation
`framePrompt(f,i)` bilingual ID block + EN line `"${shot.toLowerCase()}, ${angleEN}, ${viewEN} of ${subjEN}, ~${lens}mm full-frame lens, ${aspect} composition${dutch}${movement}${details}"`. `angleEN`/`viewEN`(from `rel=norm180(az-subjRot)`: `≤22 front · ≤67 three-quarter front · ≤112 side profile · ≤157 three-quarter back · else back`)/`subjEN` maps in digest. `scenePrompt`, `projectPrompt`, `buildPrompt`, copy scene/all.

### G25 · Undo/redo + Guide + Toast
History stack max **30**, debounce **280ms**, dedup, `historyPayload()` = `{project,state,currentFrameId,duration,smooth}`, `restoreHistory` re-`ensureProjectShape`. Guide Belajar (hero + score tiles 6/6/5/1 + 6 angle cards + 6 shot cards + 4 workflow steps + note; "Coba di Editor" CTAs `[data-guide-el/-roll]` and `[data-guide-r]` apply rig then `switchTab('editor')`). Toast slide-up pill.

---

## 3. Data model

### 3.1 Target shape — `camera-angle-guide/v2` (full)

```ts
// src/lib/editorModel.ts
type Vec3 = { x:number; y:number; z:number };
type RigSnapshot = {                       // = concept snapState()
  camPos: Vec3; target: Vec3;
  subjPos: { x:number; z:number };         // NO y
  fov:number; roll:number;
  subj:"person"|"object"; subjRot:number; trackSubject:boolean;
};
type EditorFrame = {
  id:string; name:string; notes:string; thumb:string|null;
  angle:string; shot:string; lens:number;
  az:number; el:number; dist:number;       // rounded live orbit, stored alongside s
  s: RigSnapshot;
  meta: Meta;                              // ✅ reuse dataPrompt.Meta (intent..audio,duration,transition)
};
type EditorScene = {
  id:string; name:string; notes:string;
  frames:EditorFrame[]; frameSeq:number; collapsed:boolean; notesOpen:boolean;
};
type EditorProject = {
  schema:"camera-angle-guide/v2"; name:string;
  settings:{ aspectRatio:string; fps:number; sensor:"Full Frame" };
  scenes:EditorScene[]; activeSceneId:string|null;
};
```

Live rig (mutated in place, imperative — **not** React state per tick):
```ts
type RigState = {
  camPos:Vec3; target:{x:number;y:1.35;z:number}; fov:40; roll:0;
  subj:"person"; subjRot:0; subjPos:{x:0;z:0}; trackSubject:false;
};
```

### 3.2 Reconcile with the existing app model — exact diffs

`src/lib/dataPrompt.ts` and `AppState` already model most of this:

| Concept construct | Exists in app? | Diff / action |
|---|---|---|
| `Meta`, `DEF`, `MOVES`, `ANGLES`, `SHOTS`, `ARS`, `FPS` | ✅ exact | **Reuse, do not re-declare.** |
| `synth(f)` → `s` (camPos/target/subjPos/fov/roll/subj/subjRot/trackSubject) | ✅ | Reuse for *import* conversion. **`synth` uses `ty=1.35`.** |
| `projFrame(f)` → editor frame (id,name,notes,thumb:null,angle,shot,lens,az,el,dist,s,meta) | ✅ | Identical to `EditorFrame` minus real thumb. **Reuse.** |
| `entryProject(en)` → full v2 (schema,name,settings,scenes[projFrame],activeSceneId) | ✅ | This is the v2 constructor for library entries. **Reuse.** |
| `exportProject()` v2 JSON | ✅ (AppState) | Editor JSON export funnels through the same shape. |
| `Project = {scenes:ProjectScene[]}` (AppState in-memory) | ⚠️ **lightweight** | `ProjectScene={id,name,frames:RawFrame[]}` — **no** settings/activeSceneId/notes/frameSeq/collapsed/notesOpen; frames are flat `RawFrame` (no `s`, no `thumb`, no per-frame `id`). This is the library *staging* project, NOT the editor doc. |
| `newProject/newScene/ensureProjectShape/defaultShotMeta/defaultProjectSettings/activeScene` | ❌ absent | **NEW** in `editorModel.ts` (constructors + sanitizer clamps: duration `.5–30`, strings `.slice(1200)`, angle/shot `.slice(80)`, lens `round`, aspect/fps enum guard). |
| `snapState/applyState`, `frameDuration/sceneDuration`, playback lerp | ❌ absent | **NEW** in `editorModel.ts` / `editorMath.ts`. |
| `uid()` | ✅ deterministic | Reuse (`"e"+n+"x"`; SSR-stable; editor is client-only so fine). |
| `ty` for subject/target | ⚠️ mismatch | `synth`=1.35; `CagViewport`=1.0(person)/0.7(object). **Editor uses concept values: person 1.35 / object 1.0** (`subjSeg` sets `target.y`). Normalize object frames on import + on subject switch. Read-only `CagViewport` keeps its own (review-only, minor offset acceptable). |

### 3.3 Migration / merge approach

`editorModel.ts` exports **`toEditorProject(src)`** (one-way, on demand):
- `src` is v2 JSON (`schema+settings`) → `ensureProjectShape(src)`.
- `src` is a library `Entry` → `entryProject(en)` (already v2).
- `src` is AppState `Project` (`{scenes:[{id,name,frames:RawFrame[]}]}`) → wrap each scene as `EditorScene`, map each `RawFrame` via `projFrame` (adds `s` via `synth`, `thumb:null`, merged meta), add `defaultProjectSettings()`, `activeSceneId=scenes[0].id`. For frames with `subj==='object'`, set `s.target.y=1.0`.

Reverse **`toAppProject(ep)`** (editor → library staging): map `EditorFrame`→`RawFrame` (`angle/shot/lens/az/el/dist/roll/fov/subj` + `meta`); `az/el/dist` already rounded.

Handoff wiring: EditorState **hydrates from AppState.project once on mount** (convert), then owns its own `EditorProject` + autosave. AppState keeps `project`/`setProject`/`confirmApply`/`exportProject` as the library staging surface (unchanged); expose a read of `project` (already available via `useApp()`) so the editor can pull it. Provide an explicit "Impor dari Pustaka" action to re-pull. **No live two-way binding** (ponytail — avoid reactive-sync bugs).

---

## 4. Target architecture

### 4.1 Component tree (inside the existing shell)

```
(app)/layout.tsx  <AppStateProvider><Shell>            ← REUSE (unchanged)
  Shell: <Sidebar/> + <Header/> + {children} + <GlobalModals/>   ← REUSE (Sidebar/Header get 1 nav+1 name entry)
  └─ /editor/page.tsx → <EditorStateProvider><EditorScreen/>     ← NEW route + NEW provider
       EditorScreen (owns the ONE persistent viewport across tabs)
       ├─ EditorHeaderBar        projName · stats · undo/redo · save/new · autosave   [own action bar in content slot, like DataPromptScreen]
       ├─ EditorTabBar           main Tabs(editor/preview/guide) · DragMode Seg · ViewBar · hint
       ├─ (mainTab==='editor') EditorWorkspace   CSS grid 1fr/320px × 1fr/224px
       │    ├─ QuadArea → <EditorViewport>        ← the ONE engine mount (5 ViewCell + Hud overlays)
       │    ├─ Panel
       │    │    ├─ PanelTabs (control|shot|outline)
       │    │    ├─ ControlPanel  (Seg subject, RigSliders, PresetChips ×3, toggles, OutputFrame, SavedProjects, Shortcuts)
       │    │    ├─ ShotPanel     (summary + 6-field brief)
       │    │    └─ OutlineTree
       │    └─ FramesSection      (sceneSelect, transport, DUR, loop/smooth, add/update, FrameCard strip)
       ├─ (mainTab==='preview') PreviewStage       [EditorViewport reflowed here, focusView='cam'] + PreviewPanel (prompt) + transport
       └─ (mainTab==='guide')   GuidePage           (static learn content, "Coba di Editor" CTAs)
       <Toast/>  (reuse pattern)
```

The **single `<EditorViewport>` instance is mounted once by `EditorScreen` and reflowed** into the active tab's layout via CSS (never unmounted on tab switch — that would drop the WebGL context and the live scene). This is the React-idiomatic equivalent of the concept's "re-parent the one `#glCanvas`". Preview = same engine with `focusView='cam'` (single POV viewport).

### 4.2 Per-feature target file + REUSE / EXTEND / NEW

| Concept feature | Target file | Verdict |
|---|---|---|
| DS tokens, `.ds-hatch`, keyframes | `src/app/globals.css` | **REUSE** (all chrome uses `var()`; add ≤2 editor-only helper classes if unavoidable) |
| Button / Badge / Modal / NavItem / Tabs | `src/components/ds/*` | **REUSE** verbatim |
| Read-only review viewport (mini/quad previews if any) | `src/components/CagViewport.tsx` | **REUSE** as-is |
| Domain enums/defaults/synth/projFrame/entryProject/schema/aiPrompt/toScenes/uid | `src/lib/dataPrompt.ts` | **REUSE** (import, never re-declare) |
| Shell / Sidebar / Header / GlobalModals / AppStateProvider | `src/components/shell/*`, `src/state/AppState.tsx` | **REUSE**; Sidebar +1 nav, Header +1 `SCREEN_NAMES`; AppState expose project read (already public) |
| Authoring 3D engine (scissor scene, gizmos, ortho, interaction, thumb) | `src/components/editor/viewport/editorViewportEngine.ts` | **NEW** (ports concept 3D + interaction; borrows CagViewport's dynamic-import + dispose + token-sample + ResizeObserver patterns → EXTENDS that pattern) |
| Viewport React wrapper | `EditorViewport.tsx` | **NEW** |
| Quad cell chrome / HUD | `ViewCell.tsx`, `Hud.tsx` | **NEW** |
| Editor screen + tab router + layout | `EditorScreen.tsx` | **NEW** |
| Sub-header action bar | `EditorHeaderBar.tsx` | **NEW** |
| Tab bar / dragmode / viewbar | `EditorTabBar.tsx` | **NEW** (main tabs reuse `ds/Tabs`) |
| Panel sub-tabs | `panel/PanelTabs.tsx` | **NEW** (reuse `ds/Tabs`) |
| Kontrol panel + sub-blocks | `panel/ControlPanel.tsx`, `panel/PresetChips.tsx`, `panel/OutputFrame.tsx`, `panel/SavedProjects.tsx` | **NEW** |
| Data Shot form | `panel/ShotPanel.tsx` | **NEW** |
| Outline tree | `panel/OutlineTree.tsx` | **NEW** |
| Filmstrip + transport | `FramesSection.tsx`, `FrameCard.tsx` | **NEW** |
| Full Preview prompt/transport | `PreviewPanel.tsx` | **NEW** (viewport is shared engine) |
| Guide Belajar | `GuidePage.tsx` | **NEW** |
| Themed range slider / chip / seg primitives | `ui/Slider.tsx`, `ui/Chip.tsx`, `ui/Seg.tsx` | **NEW** (editor-local; not general enough for `ds/`) |
| Rig/orbit/shot math | `src/lib/editorMath.ts` | **NEW** |
| v2 constructors/sanitizer/snap/frame durations | `src/lib/editorModel.ts` | **NEW** |
| Prompt generators + EN maps | `src/lib/editorPrompt.ts` | **NEW** |
| CSV / storyboard PNG / import / download | `src/lib/editorExport.ts` | **NEW** |
| localStorage backend + autosave + saved list | `src/lib/editorStorage.ts` | **NEW** |
| Editor context (project+rig+ui+playback+history+CRUD) | `src/state/EditorState.tsx` | **NEW** |
| Route | `src/app/(app)/editor/page.tsx` | **NEW** |

**New files (28):**
```
src/app/(app)/editor/page.tsx
src/state/EditorState.tsx
src/lib/editorMath.ts
src/lib/editorModel.ts
src/lib/editorPrompt.ts
src/lib/editorExport.ts
src/lib/editorStorage.ts
src/components/editor/EditorScreen.tsx
src/components/editor/EditorHeaderBar.tsx
src/components/editor/EditorTabBar.tsx
src/components/editor/FramesSection.tsx
src/components/editor/FrameCard.tsx
src/components/editor/PreviewPanel.tsx
src/components/editor/GuidePage.tsx
src/components/editor/ui/Slider.tsx
src/components/editor/ui/Chip.tsx
src/components/editor/ui/Seg.tsx
src/components/editor/viewport/editorViewportEngine.ts
src/components/editor/viewport/EditorViewport.tsx
src/components/editor/viewport/ViewCell.tsx
src/components/editor/viewport/Hud.tsx
src/components/editor/panel/PanelTabs.tsx
src/components/editor/panel/ControlPanel.tsx
src/components/editor/panel/PresetChips.tsx
src/components/editor/panel/OutputFrame.tsx
src/components/editor/panel/SavedProjects.tsx
src/components/editor/panel/ShotPanel.tsx
src/components/editor/panel/OutlineTree.tsx
```
**Edited files (4):** `src/components/shell/Sidebar.tsx` (+1 `navMain` entry `/editor`), `src/components/shell/Header.tsx` (+`SCREEN_NAMES["/editor"]`), optionally `src/app/globals.css` (≤2 helper classes), optionally `src/state/AppState.tsx` (no change needed — `project` already exposed via `useApp()`).

### 4.3 State: new `EditorState` context (do NOT extend `AppContextValue`)

The library's `AppContextValue` is already ~90 keys; the editor state is large and orthogonal → a **separate `EditorStateProvider`** mounted only under `/editor`. It holds:

- `project: EditorProject` (v2) — the document.
- `rig: RigState` — **a mutable ref object**, mutated in place and pushed to the engine imperatively (no React re-render per drag/slider tick). The engine owns the rAF loop and writes HUD text via refs (mirrors the concept's `updateHUD()`/`querySelectorAll` — but scoped to refs). React re-renders only on **discrete** events (frame add, tab switch, preset click that should reflect a chip's active state) via a lightweight `bump()` version counter.
- `ui`: `{ mainTab, panelTab, dragToolMode, focusView, thirdsOn, frustumOn }`.
- `playback`: `{ playing, idx, t, duration, loop, smooth }` (also ref-backed; UI reads via bump).
- `history`: `{ entries, index, busy, max:30 }` + `commitHistory/scheduleHistoryCommit(280ms)/undo/redo`.
- `refs`: engine handle (imperative API: `setRig`, `applyFocus`, `captureThumb`, `resize`), thumb via engine.
- **Actions:** all CRUD (scene/frame add/update/load/dup/del/move/rename/notes), presets, toggles, transport, save/new/import/export, `toEditorProject`/`toAppProject`.

**Why:** matches the concept's module-global design, keeps 60fps rig manipulation off the React reconciler, and leaves the library context untouched.

---

## 5. The 3D layer

### 5.1 Strategy — one engine class, one canvas, shared scene

Port the concept's **single-canvas scissor-multi-viewport** model (not five independent `CagViewport`s). Reason: the editor is *authoring* — dragging the subject in TOP must instantly reflect in CAM (one shared scene), and gizmos (`camBody`/`camHelper`/`targetDot`) must appear only in the ortho/iso views (layer discipline). Five isolated scenes can't share the live rig cheaply.

`editorViewportEngine.ts` is a plain TS class (like `CagViewport`'s `Controller`), extending that proven pattern:
- **Reuse from CagViewport:** dynamic `import("three")` on mount (keeps three@0.161 ~600KB out of the shared/library bundle), `WebGLRenderer({antialias,alpha,preserveDrawingBuffer:true})`, `setPixelRatio(min(dpr,2))`, `ResizeObserver`-driven resize, `dispose()` + `forceContextLoss()` on unmount, `_rgb(token,fallback)` DS-token sampling for auto-theming.
- **Add (ported from concept §3d-scene / §viewport):** `setScissorTest(true)`; POV `PerspectiveCamera(40,16/9,0.05,80)` + fog; 4 ortho cams `top/left/right/iso` (`views` registry with `ext/u/v/w`, `setupOrtho(id,aspect)`); lights/ground/person/object/facing/gizmos; `getOrbit/setOrbit`; `updateScene()` (rig→objects, camHelper/camBody/targetDot sync, roll applied *after* lookAt via `rotateZ`); per-view pointer handlers (`attachViewInteraction`, `handleCamViewDrag`, `handleOrthoDrag`, wheel); the rAF `loop()` (gated by activeTab; editor draws `focusView||['cam','top','left','right']` scissor rects, preview draws single `cam`, guide skips); imperative `updateHUD()` writing badge/readout text into refs passed from React.
- **Thumbnails:** separate offscreen `thumbRenderer = WebGLRenderer({antialias,preserveDrawingBuffer:true})`, `setSize(320,180)`; `captureThumb()` sizes to `outputAspect()`, renders POV, `toDataURL('image/jpeg',0.7)`.

### 5.2 Layer discipline (must preserve)
`povCam.layers.enable(0)` only; `camHelper`/`camBody`/`targetDot` → `layers.set(1)` (traverse children); ortho cams `layers.enable(0); layers.enable(1)`. Else POV shows its own camera gizmo, or overviews hide it.

### 5.3 Multi-view / focus / orbit / pan / zoom / target-lock / subject
- Quad = 5 `ViewCell` HTML overlays (transparent, `z-index:1`, `pointer-events` on chrome only) over the one canvas; `.quad[data-focus]` (React state `focusView`) maximizes one cell (`grid-area:1/1/3/3`); iso hidden unless focused.
- Orbit/pan/zoom via the ported per-view pointer handlers with the **exact sensitivities/clamps in G12**. `dragToolMode` selects orbit vs move-camera vs move-subject.
- Target-lock (`trackSubject`): subject moves ⇒ `target.x/z += clamped delta` (sliders + `moveSubjectAbs`).
- Subject = shared `person`/`objectSubj` groups toggled by `state.subj`, posed by `subjPos`+`subjRot`, with `facingGroup` cone.

### 5.4 Lazy-loading & disposal
- three loaded only via `import("three")` inside the engine → Next per-route code-split + dynamic import ⇒ zero three in the library route/bundle; downloaded only when `/editor` mounts.
- Single renderer + single offscreen thumb renderer; both disposed + context-lost on `EditorScreen` unmount. Geometries/materials created once (module-level in the engine build), reused across frames. `ResizeObserver` disconnected on dispose.

---

## 6. Phased build order (FULL scope — 8 phases)

Each phase ends with `npm run build` green (typecheck + lint) and a manual smoke checklist. Ordered so the **3D viewport + rig come first**, playback / guide / export last.

### P1 — Route + shell wiring + EditorState skeleton + static layout
**Files:** `editor/page.tsx`, `EditorState.tsx` (project v2 model + `newProject/newScene/ensureProjectShape/defaultShotMeta/defaultProjectSettings/activeScene` in `editorModel.ts`, rig ref, ui flags), `editorModel.ts`, `editorMath.ts` (pure math: deg/rad, clamp, norm360/180, getOrbit/setOrbit, focalLength/fovFromFocal, angleLabel/shotLabel/subjHeight, aspectNumber, lerp/lerpAngle/smoothstep), `EditorScreen.tsx` (tab router + grid scaffold with placeholder regions), `EditorTabBar.tsx`, `EditorHeaderBar.tsx`, `ui/Seg.tsx`, edit `Sidebar.tsx` + `Header.tsx`.
**Done-bar:** `/editor` renders inside shell; Editor/Preview/Guide tabs switch; empty quad/panel/filmstrip regions laid out on the 1fr/320px × 1fr/224px grid; nav entry + breadcrumb correct; build green. Unit-check `editorMath` round-trips (getOrbit∘setOrbit, focalLength∘fovFromFocal) against concept constants.

### P2 — 3D authoring engine core (viewport renders)
**Files:** `viewport/editorViewportEngine.ts` (renderer, scene, lights, ground, person, object, facing, povCam, gizmos, 4 ortho cams, `setupOrtho`, scissor `loop()`, `getOrbit/setOrbit`, `updateScene`, layer discipline, token sampling, dispose/resize), `EditorViewport.tsx` (dynamic three, mount/dispose, feed rig ref), `ViewCell.tsx` (cell chrome, vname).
**Done-bar:** quad shows live POV + top/left/right (iso on focus); default rig (az30/el4/dist3/fov40/targetY1.35) framed on the person; disposes cleanly on unmount (no context leak); build green.

### P3 — Rig controls + presets + toggles + HUD (authoring via UI, no drag yet)
**Files:** `ui/Slider.tsx`, `ui/Chip.tsx`, `panel/PanelTabs.tsx`, `panel/ControlPanel.tsx`, `panel/PresetChips.tsx`, `panel/OutputFrame.tsx`, `Hud.tsx`, viewbar/maxbtn focus in `EditorTabBar.tsx`/`ViewCell.tsx`.
**Done-bar:** 6 camera + 3 subject sliders drive the rig visibly (imperative, no re-render storm); angle/shot/lens presets + subject seg + focus/track/thirds/frustum/reset toggles work with exact formulas; HUD badges/readout/format-border update; aspect/fps change real framing; viewbar/maxbtn/keys 1–5/Esc focus works; build green.

### P4 — Pointer interaction + keyboard navigation
**Files:** interaction handlers in `editorViewportEngine.ts` (`attachViewInteraction`, `handleCamViewDrag`, `handleOrthoDrag`, wheel), drag-mode seg wiring, keyboard hook in `EditorState.tsx`/`EditorScreen.tsx` (`handleKeys(dt)` in the rAF loop, keydown/keyup Sets, `typing()` guard).
**Done-bar:** drag orbits/pans/moves-camera/moves-subject per mode with exact sensitivities (0.35/0.3, dist·0.0022, dist·0.0016, wheel 1+dy·0.001) and clamps; WASD fly (8.5/2.4) + Q/E + Shift + arrows orbit (150/70, el 0.7×); F focus, Esc/1–5 view; Target-Lock follows; build green.

### P5 — Data Shot + frame model + frame/scene CRUD + filmstrip + outline
**Files:** `panel/ShotPanel.tsx`, `snapState/applyState` + `frameDuration/sceneDuration` in `editorModel.ts`, `captureThumb` in engine, `FramesSection.tsx`, `FrameCard.tsx`, `panel/OutlineTree.tsx`, scene/frame CRUD + selectors in `EditorState.tsx`, dirty tracking (`frameIsDirty`, `refreshFrameAction`).
**Done-bar:** brief form + dirty state; Add captures a frame with a real jpeg thumb sized to aspect; Update/Load/Dup/Del/Move/Rename/Notes for frames + scenes; filmstrip + outline tree stay in sync (`.current`/`.dirty`/`.activeScene`); scene selectors synced; build green.

### P6 — Playback engine
**Files:** playback state + `stepPlayback` + transport in `EditorState.tsx` (driven by the engine rAF `loop()`), duration slider + loop/smooth in `FramesSection.tsx`.
**Done-bar:** Play tweens through frames using **per-frame `frameDuration`**, smoothstep ease, `lerpAngle` for subjRot, discrete `subj` snap, non-loop freeze on last, cut branch; transport prev/play/next/stop + spacebar; `body.playing` dot blink + playBadge; `dt` capped 0.05; build green.

### P7 — Persistence + undo/redo + Full Preview
**Files:** `editorStorage.ts` (keys, backend, save/list/autosave), `SavedProjects.tsx`, New Project, undo/redo (`historyPayload`, `commitHistory` 280ms debounce, `restoreHistory`, 30 cap) in `EditorState.tsx`, `PreviewPanel.tsx` + Preview reflow of the shared viewport (`focusView='cam'`), `editorPrompt.ts` (frame/scene/project prompts + EN maps), copy scene/all.
**Done-bar:** Save→reload persists the v2 project (localStorage); saved list loads; autosave flushes (`.autosave.on`); undo/redo across rig + project mutations; Preview shows single POV + generated prompt + synced scene selector; build green.

### P8 — Export/Import + Guide Belajar + library interop
**Files:** `editorExport.ts` (JSON, CSV 25-col, Prompt TXT, Storyboard PNG, import + v1 migration, `safeFileName`/`downloadBlob`), `GuidePage.tsx` (hero/score/6 angle/6 shot/4 workflow/note + "Coba di Editor" CTAs), Toast, library→editor handoff (`toEditorProject` hydrate-on-mount + "Impor dari Pustaka" action; `toAppProject` for push-back).
**Done-bar:** all four exports produce valid files (JSON re-imports lossless minus thumbs; CSV opens with correct 25 cols + BOM; PNG contact sheet; TXT prompt); v1 legacy import works; Guide CTAs set the rig and jump to editor; opening `/editor` after "Terapkan" in the library shows the applied scenes; full build green.

---

## 7. Reuse-vs-port table, risks, verification

### 7.1 Reuse vs port (summary)

| Concept element | Decision |
|---|---|
| Design tokens / `ds/*` primitives / shell / routing | **Reuse as-is** |
| Domain enums, `Meta`/`DEF`, `synth`, `projFrame`, `entryProject`, `schema*`, `aiPrompt`, `toScenes`, `uid` | **Reuse from `dataPrompt.ts`** (import; never re-declare) |
| `CagViewport` (read-only review) | **Reuse** for any review/mini previews |
| CagViewport engine *pattern* (dynamic three, dispose, ResizeObserver, token-sample) | **Extend** into the authoring engine |
| Concept 3D scene + interaction + HUD + playback + presets + exports + guide | **Port** faithfully (values/formulas verbatim) into the NEW files |
| r128 inlined Three.js | **Delete/ignore** — see 7.2 |

### 7.2 Three.js version resolution (required decision)
The concept inlines **Three r128** (minified, in `project/three.min.js`); the app depends on **`three@0.161.0` + `@types/three@0.161.0`** as npm deps, loaded by `CagViewport` via dynamic `import("three")`. **Resolution: do NOT inline r128 and do NOT add a CDN/second Three (CSP + offline-safe requirement).** Reuse the installed `three@0.161` via the same dynamic-import-typed-as-`any` pattern `CagViewport` already uses. Port the r128 scene code to the 0.161 API with these deltas:
- `renderer.outputEncoding = THREE.sRGBEncoding` → **`renderer.outputColorSpace = THREE.SRGBColorSpace`**.
- `camera.getWorldDirection()` → **`getWorldDirection(new THREE.Vector3())`** (target required).
- Basis columns (concept `matrixColumn(m,i)`) → **`new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, i)`** (0=right, 1=up).
- `Fog`, `GridHelper`, `CameraHelper`, `Layers`, `OrthographicCamera`, scissor API (`setScissorTest`/`setViewport`/`setScissor`), all geometries/materials/lights used are **stable** in 0.161.
- Color management is default-on in 0.161 (post-r155) → material sRGB hex renders near-identical; accept, or pin `THREE.ColorManagement.enabled` only if a parity issue surfaces. Types via `@types/three@0.161`; engine uses `T = any` (like `CagViewport`) to stay lean.

Net: one Three version, one lazy chunk, loaded only on `/editor`.

### 7.3 Risks / gotchas
1. **Single-canvas re-parenting.** Mount the ONE `EditorViewport` once in `EditorScreen`; reflow it via CSS between Editor and Preview layouts; **never unmount on tab switch** (drops WebGL context + scene). Preview = same engine, `focusView='cam'`.
2. **Imperative vs React 60fps.** Engine owns the rAF loop and mutates the rig ref + writes HUD text into refs; React re-renders only on discrete events (`bump()` counter). Sliders read/write output text imperatively (as the concept does). Driving drag/slider ticks through React state would tank performance.
3. **`ty` mismatch (1.35 vs 1.0/0.7).** Editor uses concept values (person 1.35 / object 1.0); normalize on subject switch + on import (object frames from `synth` come in at 1.35).
4. **Layer discipline** (§5.2) — POV must not see its own gizmo; ortho must show it.
5. **Thumbnail bloat.** jpeg dataURLs in every frame inflate JSON + can hit localStorage quota; keep q0.7/320px (faithful) and surface the quota `storage-note` warning; autosave should catch `QuotaExceededError` and toast.
6. **Pointer plumbing.** `touch-action:none` + `setPointerCapture` on cells; `preventDefault` on `contextmenu` (right-drag pan) and `wheel` (`passive:false`).
7. **Reduced-motion.** Guard `tally` blink + `flash` under `prefers-reduced-motion` (concept does).
8. **Shift multipliers.** Preserve handler numbers (fly 8.5/2.4, orbit 150/70), not the "×3.5" hint label.
9. **`stopPlayback()` universal guard.** Call at the head of every mutating action (add/update/load/CRUD/preset/keyboard) so the loop doesn't fight edits.
10. **Localization.** Strings are Bahasa Indonesia; app is `lang="id"` — keep as-is.
11. **`uid` determinism.** Reuse `dataPrompt.uid` (client-only editor; avoids any hydration concern).

### 7.4 Verification approach
- **Per phase:** `npm run build` (typecheck + `next lint`) green + the phase done-bar checklist run manually under `npm run dev` on `/editor`.
- **Math parity (no test framework — throwaway `tsx`/node script, ponytail):** assert against the digest constants — `getOrbit∘setOrbit` round-trip within ε; `focalLength(fovFromFocal(mm))≈mm`; shot-size solve `d=(r·h)/(2·tan(fov/2))` re-classifies to the intended band via `shotLabel` thresholds; `lerpAngle` picks shortest arc; angle thresholds 62/16/-10/-40; sensor const 12.
- **Round-trip:** export v2 JSON → re-import → deep-equal (excluding regenerated thumbs/ids); v1 `{frames:[]}` import wraps to one scene.
- **Interop:** "Terapkan" in the library then open `/editor` shows the applied scenes; `toAppProject` maps back without loss of `az/el/dist/roll/fov/subj/meta`.
- **Constant audit:** grep the ported files against the "magic constants" list in the digests (sensitivities, scales, clamps, thresholds, durations, defaults) before P8 sign-off.

---

### Appendix — absolute paths
- Concept: `/home/rahman/projects/framepilot/concept/camera-angle-guides-pro.html`
- Reuse: `/home/rahman/projects/framepilot/src/lib/dataPrompt.ts`, `/home/rahman/projects/framepilot/src/state/AppState.tsx`, `/home/rahman/projects/framepilot/src/components/CagViewport.tsx`, `/home/rahman/projects/framepilot/src/components/ds/*`, `/home/rahman/projects/framepilot/src/components/shell/*`, `/home/rahman/projects/framepilot/src/app/globals.css`
- New root: `/home/rahman/projects/framepilot/src/components/editor/*`, `/home/rahman/projects/framepilot/src/state/EditorState.tsx`, `/home/rahman/projects/framepilot/src/lib/editor*.ts`, `/home/rahman/projects/framepilot/src/app/(app)/editor/page.tsx`
