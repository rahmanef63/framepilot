# Contributing to Camera Angle Guide Pro (framepilot)

Thanks for your interest in improving **Camera Angle Guide Pro** — a browser-based 3D camera previsualization and shot planner that emits AI-video-ready camera prompts for Runway, Kling, Veo, Luma, Higgsfield, Wan, Seedance, Hailuo, Pika, and LTX Studio.

This guide covers everything you need to get a local dev environment running, the conventions we follow, and how to open a pull request that lands cleanly.

## Table of contents

- [Code of Conduct](#code-of-conduct)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Everyday commands](#everyday-commands)
- [Project layout](#project-layout)
- [Coding conventions](#coding-conventions)
- [Commit convention](#commit-convention)
- [Pull request flow](#pull-request-flow)
- [CI and deployment](#ci-and-deployment)
- [Reporting bugs and requesting features](#reporting-bugs-and-requesting-features)

## Code of Conduct

This project ships a [Code of Conduct](./CODE_OF_CONDUCT.md) (Contributor Covenant v2.1). By participating you agree to uphold it. Please read it before contributing.

## Prerequisites

- **Node.js `>= 22`** (the production image builds on `node:22-alpine`; match it to avoid surprises).
- **npm** (the repo is locked with `package-lock.json` — use `npm ci`, not `pnpm`/`yarn`).
- A **Convex** deployment you can point at for local development. A free Convex Cloud dev deployment is fine — `npx convex dev` provisions one for you the first time you run it.
- A modern browser with WebGL support (the editor renders with three.js).

## Local setup

```bash
# 1. Clone
git clone https://github.com/rahmanef63/framepilot.git
cd framepilot

# 2. Install exactly what the lockfile pins
npm ci

# 3. Create your local env file from the tracked template
cp .env.example .env.local
```

Open `.env.local` and fill in the Convex variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | yes | Your Convex deployment URL. Shipped in the client bundle — **public, non-sensitive**. |
| `CONVEX_DEPLOY_KEY` | for deploy only | Secret. Used by `npx convex deploy`. Never prefix it with `NEXT_PUBLIC_`. |
| `ADMIN_EMAILS` | optional | Comma-separated allowlist for the `/admin` route's server-side `requireAdmin()`. |

> `.env.local` is gitignored. Only `.env.example` is tracked — never commit real secrets.

Now run the backend and the frontend in **two terminals**:

```bash
# Terminal 1 — Convex backend (codegen + live functions + local schema push)
npx convex dev

# Terminal 2 — Next.js dev server
npm run dev
```

The app is served at http://localhost:3000. Keep `npx convex dev` running while you work: it regenerates `convex/_generated/` and pushes schema/function changes as you edit files under `convex/`.

## Everyday commands

| Task | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Convex backend (dev) | `npx convex dev` |
| Production build | `npm run build` (runs `next build --webpack`) |
| Type-check (no emit) | `npx tsc --noEmit` |
| Lint | `npm run lint` |

Before opening a PR, run **`npx tsc --noEmit`** and **`npm run build`** locally — see [CI and deployment](#ci-and-deployment) for why this matters.

## Project layout

```
src/
  app/                 Next.js 16 App Router
    (app)/             Main UI routes
      page.tsx         /          → the 3D Studio editor (home)
      editor/          the shot-planner editor surface
      library/         /library   → project library ("Pustaka")
      template/        /template  → starter presets
      panduan/         /panduan   → the cookbook / guide
      admin/           /admin     → email-allowlisted admin
    docs/              /docs      → standalone documentation
    api/               route handlers
  components/
    editor/            the 3D editor components (three.js canvas, controls, panels)
    dataprompt/        DataPrompt prompt-library UI
    admin/ auth/ ds/ gallery/ onboarding/ shell/   supporting UI
  state/               client state (AppState, EditorState + slices)
  lib/
    prompt/            platform prompt encoders (types, platforms, cameraPrompt)
    editor/ editorModel/ cameras.ts   editor math, model, camera math
    dataPrompt/ theme/                 DataPrompt + theming helpers
  i18n/                5-language catalogs (ar, en, es, id, zh) under messages/
convex/                Convex backend (schema, auth, projects, admin, http)
```

Good entry points:

- **Adding/adjusting an AI-video platform prompt?** Start in `src/lib/prompt/` (`platforms.ts`, `cameraPrompt.ts`, `types.ts`).
- **3D editor / camera behavior?** `src/components/editor/` and `src/lib/editor*`, `src/lib/cameras.ts`.
- **Backend data / auth / admin?** `convex/`.
- **Copy / translations?** `src/i18n/messages/` — keep all five language catalogs in sync when you add a key.

## Coding conventions

- **TypeScript everywhere.** Keep `npx tsc --noEmit` green — no new type errors.
- three.js is **dynamically imported** on the client; keep it out of server components and never import it at module top level in shared code.
- When you add a user-facing string, add its key to **all five** i18n catalogs (`ar`, `en`, `es`, `id`, `zh`). Don't ship an English-only string.
- Keep secrets server-side. Only values that are safe in the browser bundle may carry the `NEXT_PUBLIC_` prefix.
- The app is **mobile-heavy** — verify layout and touch interactions at small viewport sizes for any UI change.

## Commit convention

We use [**Conventional Commits**](https://www.conventionalcommits.org/). Examples:

```
feat(prompt): add Seedance camera-move encoder
fix(editor): clamp dolly distance on touch pinch
docs(panduan): add three-point lighting recipe
refactor(state): split EditorState selection slice
```

Common types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`. Your **PR title** should also be a valid Conventional Commit.

## Pull request flow

1. Fork the repo (or branch, if you have write access).
2. Create a topic branch: `git checkout -b feat/my-change`.
3. Make your change; keep commits focused and Conventional-Commit-formatted.
4. Run locally: `npx tsc --noEmit` and `npm run build` (and `npm run lint`).
5. For UI changes, attach **before/after screenshots including a mobile viewport**.
6. Open a PR against `main`, fill out the [PR template](./.github/PULL_REQUEST_TEMPLATE.md), and link the issue it closes.

Keep PRs small and reviewable. Large refactors are easier to land when discussed in an issue first.

## CI and deployment

Heads up on how this project ships:

- **There are no cloud GitHub Actions on push.** CI runs **locally** via pre-push hooks (type-check + build). That means the burden is on you to run `npx tsc --noEmit` and `npm run build` before pushing — a red build won't be caught by a cloud runner.
- **Deploys are automatic.** On merge to `main`, Dokploy builds a standalone Docker image and deploys it to production (https://frame-pilot.rahmanef.com). There is no manual release step, so please make sure `main` stays green.

## Reporting bugs and requesting features

Use the issue forms:

- [Bug report](./.github/ISSUE_TEMPLATE/bug_report.yml)
- [Feature request](./.github/ISSUE_TEMPLATE/feature_request.yml)

Security issues follow a different, private path — see [SECURITY.md](./SECURITY.md).

Thanks for contributing! — Abdurrahman Fakhrul ([@rahmanef63](https://github.com/rahmanef63))

## Testing

There's a committed Playwright smoke suite (`tests/smoke.spec.ts`) that boots the
**standalone production build** and checks every core route (`/`, `/library`,
`/docs`, `/panduan`) renders without uncaught page or console errors, including a
mobile viewport with a no-horizontal-overflow check.

```sh
npx playwright install chromium   # first run only — grabs the browser binary
npm run build                     # smoke serves an EXISTING build, so build first
npm run test:smoke                # boots serve:standalone and runs the suite
```

`npm run build` must precede `npm run test:smoke` — `serve:standalone` only serves
what `next build` already produced; it does not compile.

## Git hooks

Run this once per clone:

```sh
npm run hooks:install
```

(It also auto-installs via the `prepare` script on `npm install`.) This points
`core.hooksPath` at `.githooks/`, activating the **pre-push** hook. The hook
typechecks the *exact commit you're pushing* — it checks out `HEAD` into a throwaway
worktree and runs `tsc --noEmit` there, **not** against your dirty working tree.
That's what catches a forgotten `git add`: a build that's green locally because an
uncommitted file is present, but broken on `origin/main` where that file never
shipped. If the committed tree fails to typecheck, the push is blocked.
