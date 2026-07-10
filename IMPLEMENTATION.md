# Data Prompt — Camera Angle Guide Pro

Production implementation of the **DataPromptScreen** design exported from Claude
Design. Built with **Next.js (App Router) + TypeScript**, recreating the ds-a
(Rupa preset) prototype pixel-for-pixel with real, working functionality.

The original design bundle is kept under [`project/`](project/) and the design
conversation under [`chats/`](chats/) for reference.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
# or
npm run build && npm start
```

## What's implemented

The **Data Prompt** screen (`/`) inside the platform shell — a header + a
collapsible, DRY sidebar (icon rail ⇄ full labels + source-filter sub-menu) that
stay fixed while the content pane swaps between three shared-state views:

- **Grid** — import-first library cards (thumb, source badge, angle/shot/lens,
  AI-filled meter, actions).
- **Tabel** — dense dataset-style rows.
- **Split** — list + inspector with a live **3D mini-viewport** (drag to orbit),
  scene/shot breakdown, AI-vs-default field map, and a live
  `camera-angle-guide/v2` JSON preview.

Everything does the real work:

- **Import** — paste JSON · upload `.json` · YouTube link · photo/reference
  (each parses into normalized entries; YouTube/Photo tabs generate the
  ready-to-paste AI prompt + schema).
- **Schema** — download the JSON schema (**Full / Simplified** toggle) and copy a
  prompt that hands the AI the schema + angle/shot/movement enums.
- **Selection** — checkboxes with a bulk bar: **Apply** (merge into a chosen
  scene *or* create new scenes), **Export**, **Delete**.
- **Export** — valid `camera-angle-guide/v2` project JSON + library import/export.
- **Edit / Delete**, source filtering, empty states, and a bilingual (ID · EN) UI.
- **3D** — a lazy-loaded Three.js viewport (subject + camera marker + FOV frustum
  + azimuth ring), openable from any view; **Perbesar 3D** opens a quad-view modal
  (Perspektif · Atas · Samping · POV kamera) with a per-frame picker.

The other sidebar routes (`/beranda`, `/proyek`, `/template`, `/panduan`) are
minimal stub screens, as agreed.

## Structure

```
src/
  app/
    layout.tsx            root: fonts, Rupa tokens, <html data-preset="rupa">
    globals.css           ds-a Rupa tokens + derived tokens + typography + resets
    icon.svg              app/favicon
    (app)/
      layout.tsx          AppStateProvider + Shell
      page.tsx            Data Prompt screen (/)
      beranda|proyek|template|panduan/page.tsx   stub routes
  components/
    ds/                   ported ds-a primitives (Button, Badge, NavItem, Tabs, Modal)
    shell/                Sidebar, Header, GlobalModals, Shell
    dataprompt/           DataPromptScreen + GridView / TableView / SplitView
    CagViewport.tsx       Three.js 3D viewport (lazy-loaded, disposed on unmount)
    StubScreen.tsx
  lib/dataPrompt.ts       domain logic: seed, schema, parse/normalize, project convert
  state/AppState.tsx      React context: all state, actions, derived view-models
```

## Notes

- **Fonts**: `globals.css` `@import`s *Plus Jakarta Sans* from Google Fonts — the
  same source the ds-a `fonts.css` uses. The font stack falls back to `system-ui`
  if the CDN is unreachable. To fully self-host, drop the woff2 files in
  `public/` and replace the `@import` with `@font-face` rules.
- **Theming**: Rupa preset only (light), per the agreed scope. A `data-theme="dark"`
  token block is kept in `globals.css` for parity if dark mode is wanted later.
- **3D**: `three` is dynamically imported inside the viewport component, so it
  stays out of the shared bundle and only loads when a viewport mounts.
