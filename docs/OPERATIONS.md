# Operations

How framepilot deploys, how its data is backed up, and the known trade-offs that
are deliberately accepted (so nobody "fixes" them by mistake).

## Deploy model — two independent halves

framepilot has a **frontend** (Next.js, on Dokploy) and a **backend** (Convex
Cloud, deployment `calculating-dalmatian-236`). They deploy **separately**:

| Change is under… | Ships via | Trigger |
| --- | --- | --- |
| anything except `convex/` | **Dokploy** builds the standalone Docker image | automatic on `git push` to `main` |
| **`convex/`** (schema, functions) | **`npx convex deploy`** | **manual — `git push` does NOT deploy it** |

> ⚠️ **The trap:** a `git push` rebuilds the frontend but leaves the Convex
> backend on its previous version. A schema/function change is not live until you
> run `npx convex deploy`. The `pre-push` hook prints a reminder when your push
> touches `convex/`.

Deploy the backend (reads `CONVEX_DEPLOY_KEY` from `.env.local`):

```bash
npx convex deploy --yes
```

The frontend bakes `NEXT_PUBLIC_CONVEX_URL` at build time (Dokploy build-arg).
`convex/_generated/` **is committed** — the Docker build does not run codegen, so
the generated `api.d.ts` must be up to date in the repo.

## Backups

- **Convex Cloud** keeps its own snapshot-exports: dashboard → Settings → Backup.
- **Local belt-and-suspenders:** `sh scripts/backup-convex.sh` writes a zip of the
  whole deployment to `~/backups/framepilot/` (**outside the repo — it contains
  user emails; never commit it**). Wire it to a daily cron; see the script header.

## Restore

`npx convex import --replace <snapshot.zip>` (test against a dev deployment
first — `--replace` overwrites data).

## Known trade-offs (accepted on purpose)

- **`npm audit` — PostCSS moderate advisory.** Transitive, build-time only (CSS
  stringify on our own trusted stylesheets — not an exploitable path here). The
  only "fix" `npm audit fix --force` offers is downgrading Next 16 → 9, which
  would break the app. **Left as-is.**
- **`@convex-dev/auth` pinned at `0.0.91`.** Pre-release, but pinned deliberately:
  newer lines interact badly with the token-refresh bug (convex-auth#271), which is
  also why we kept `src/middleware.ts` instead of `proxy.ts`. Revisit when #271 lands.
- **Email verification is not enforced** on Password sign-up. Residual "junk
  signup" surface, but low-impact: `/admin` is an email **allowlist** (a fake
  account can't escalate), project data is per-user, and `@convex-dev/auth`'s
  `authRateLimits` throttles sign-up attempts. Enforce verification (needs an email
  provider) if abuse ever shows up.

## framepilot-video leftovers (see the two-apps note)

The Convex deployment `calculating-dalmatian-236` was **reused** from the retired
`framepilot-video` tool. Consequences:

- A stray **`frames` table** (video-era data, not in this app's schema) lingers in
  the deployment. Harmless (Convex ignores unmanaged tables) but can be cleared.
- The old **`framepilot-video` Dokploy app** still exists but is offline / has no
  domain. It can be deleted to free resources — it does **not** share anything with
  this app except the Convex deployment, which framepilot now owns. **Do not delete
  the Convex deployment.**
