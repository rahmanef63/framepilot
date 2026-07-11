# framepilot — Camera Angle Guide Pro

**framepilot** turns shot ideas and references — a photo, a YouTube link, pasted text, or JSON — into structured **camera-angle data** (schema `camera-angle-guide/v2`) plus ready-to-paste **AI prompts**, and lets you plan and author shots in an interactive **3D studio**. Built for filmmakers, content creators, and storyboard artists who want to go from a rough idea to a precise, reusable shot spec without switching tools.

## The two screens

- **Pustaka / Data Prompt (`/`)** — import and manage entries: parse ideas/references into structured angle data, then apply or export them.
- **Studio 3D (`/editor`)** — author the camera rig in an interactive 3D scene, capture frames, and export a prompt, CSV, or storyboard.

## The flow

**Impor data (Pustaka)** → **author/refine in Studio 3D** → **Ekspor / Salin Prompt.**

Supporting screens: **Beranda** (home / quick start), **Panduan** (guide), **Proyek** and **Template** (planned: saved projects and reusable scene/shot presets).

---

## Stack

- Next.js 15 + React 19, App Router (`src/app/(app)/*`)
- Own design-system primitives in `src/components/ds/*` (Button, Badge, Modal, Tabs, NavItem)
- Rupa CSS tokens in `src/app/globals.css` (`:root` + `[data-theme=dark]`) with Light / Dark / System mode and a tweakcn preset switcher — `globals.css` is the single source of raw colors; everything else uses `var(--token)`
- Convex Cloud + `@convex-dev/auth` (Password)
- Bahasa Indonesia UI

## Develop

```bash
npm install
npx convex dev   # backend (in one terminal)
npm run dev      # Next.js dev server (in another)
```

## Deploy

Deployed on Convex Cloud + a Next.js host, live at **frame-pilot.rahmanef.com**. Push to `main` triggers the build.

---

## Design handoff (origin)

This repo started from a **Claude Design** (claude.ai/design) handoff bundle. The original design conversation and HTML/CSS/JS prototypes live under `chats/` and `project/`; `project/DataPromptScreen.dc.html` was the primary Data Prompt design. Those files are reference prototypes, not production code — the app in `src/` is the real implementation.
