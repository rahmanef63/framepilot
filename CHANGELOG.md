# Changelog

All notable changes to **Camera Angle Guide Pro** (framepilot) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Camera Angle Guide Pro is a browser-based 3D camera previsualization and shot
planner that emits AI-video-ready camera prompts for Runway, Kling, Veo, Luma,
Higgsfield, Wan, Seedance, Hailuo, Pika, and LTX Studio.

- **Live:** https://frame-pilot.rahmanef.com
- **License:** MIT

## [0.1.0] - 2026-07-16

First public open-source release. Ships full multi-language support, a
professional codebase pass, and repository hygiene for outside contributors.

### Added
- Multi-language UI across **five locales** — Indonesian, English, Spanish,
  Chinese, and Arabic — including full **right-to-left (RTL)** layout support.
- Mobile-reachable language switcher inside the user menu, so locale can be
  changed without a desktop-only control.
- Complete i18n coverage down to the last-mile data and logic strings (100%).

### Changed
- Global app header is now cleanly separated from the per-feature header,
  fixing an obscured mobile language switcher along the way.
- Editor and Full Preview tabs are now desktop-only, reflecting where each view
  is actually usable.
- Codebase professionalized for open source: refreshed docs, an `.env.example`,
  and a consistent Conventional Commits history.

### Removed
- Roughly **420 lines of dead code and one dependency** removed in a repo-wide
  cleanup audit — deduplicated hooks and helpers, merged duplicate logic, and
  a leaner `tsconfig`/auth surface — with no user-visible behavior change.

## [0.6.0] - 2026-07-15

### Added
- Mobile scene management via a long-press menu on the scene strip.

### Changed
- The **Template** browser is merged into the **Pustaka** (project library) so
  starters and saved projects live in one place.

## [0.5.0] - 2026-07-14

### Added
- **Installable PWA** — web app manifest, service worker, app icons, and an
  automatic "new version available" update toast.
- **LTX Studio** added as a target platform, bringing the emitter to the full
  set of supported AI-video engines.
- Per-frame and global **camera brand presets** that inject a look tag into the
  generated prompt, plus enriched brand copy and production detail.
- Unified, responsive **accordion gallery** that presents Pustaka and Template
  content together.
- In-viewport camera menu consolidation with quick access to the Tour and
  Panduan (cookbook), and update-frame controls with a camera picker directly
  on the preview.
- Long-press CRUD menu on mobile frame thumbnails.
- Route-level error and not-found boundaries.

### Changed
- Upgraded to **Next.js 16** and **React 19.2** as the new stack baseline.
- Migrated all interface glyphs to **lucide-react** for a consistent icon set.
- Reworked the mobile editor chrome — merged the tab bar and header, moved
  overflow (⋯) actions into a drawer, enlarged touch targets, and expanded the
  usable canvas area.
- Large internal refactor: `AppState`, `editorModel`, `dataPrompt`, and the
  global modals were each decomposed into focused modules (≤200 LOC), and the
  3D viewport/engine port was relocated into a shared domain layer — all
  UI-identical.

### Removed
- Removed the redundant header Panduan button (now reachable from the viewport).
- Dead-code sweep across the app.

## [0.4.0] - 2026-07-13

### Added
- Mobile **three-zone editor layout** with two-finger pinch-to-zoom.

### Removed
- Swept dead CSS and orphaned files/exports (~580 lines).

## [0.3.0] - 2026-07-12

### Added
- **Studio is now the home route**, with the shot manager living in the app
  sidebar, a standalone `/docs` page, and a first-run onboarding tour.
- Dedicated **Prompt tab** with live prompt toggles, an AI-platform dropdown,
  an optional brief field, and icon-based controls.
- Reconfigurable quad viewport with custom saved views, a three-tab inspector,
  and an on-screen mobile capture bar.
- Clearer Scene and Frame controls throughout the editor.

### Changed
- Slimmed the shell: navigation moved into the header, the side rail dedicated
  to scene/frame, and the footer collapsed into the nav-user dropdown.

### Fixed
- Genuinely responsive mobile shell with natural scrolling — the real fix for
  the reported unresponsive layout.
- Cleared the iOS status bar and Safari URL bar using safe-area insets and
  `dvh` units.
- Frame-card thumbnails now render for template and imported frames.

## [0.2.0] - 2026-07-11

### Added
- **Authentication and cloud sync** — Convex Cloud with `@convex-dev/auth`
  (Password) and per-user project storage.
- Public marketing landing page at `/`, with the project library ("Pustaka")
  and its multiple views, a starter **Template** gallery, and a **cookbook**
  (Panduan).
- **Admin panel** gated by an email allowlist.
- **Light / Dark / System** theme modes backed by a single source of truth for
  CSS design tokens.
- Platform-tuned **Camera Prompt** as the product's hero output: real camera
  geometry encoded into every platform prompt, with all ten video platforms
  visible.
- Editor 3D scene quality brought into the library preview grid.
- **Standalone build output and Dockerfile** for Dokploy auto-deploy.

### Changed
- Consolidated navigation to three core destinations and merged the separate
  project lists into a single `/library`.
- Studio promoted to the home experience; resolved the internal prompt naming
  collision.

### Removed
- Removed ~11.8k lines of bundled reference material.

## [0.1.0] - 2026-07-10

### Added
- Initial **Camera-Angle-Guide-Pro 3D editor** — scene model, state, engine,
  viewport, and controls, with panels, playback, export, and an on-screen guide.
- Initial **Data Prompt** screen scaffolded as a Next.js + TypeScript app from
  the Claude Design handoff.
