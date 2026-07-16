## Summary

<!-- What does this PR change and why? Keep it focused. -->

## Linked issue

<!-- e.g. Closes #123. If there's no issue, briefly justify the change. -->

Closes #

## Type of change

<!-- Check all that apply. -->

- [ ] `fix` — bug fix
- [ ] `feat` — new feature
- [ ] `docs` — documentation only
- [ ] `refactor` — no behavior change
- [ ] `perf` — performance
- [ ] `chore` / `build` / other

## Screenshots (for UI changes)

<!-- Before/after images. The app is mobile-heavy — INCLUDE a mobile viewport screenshot for any UI change. -->

## Checklist

- [ ] Type-check passes locally: `npx tsc --noEmit`
- [ ] Production build passes locally: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] UI changes include screenshots, **including mobile**
- [ ] New user-facing strings added to **all 5** i18n catalogs (`ar`, `en`, `es`, `id`, `zh`)
- [ ] PR title follows [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat(prompt): ...`)
- [ ] No secrets, credentials, or `.env` / `.env.local` files committed

> Reminder: CI runs **locally** (pre-push hooks) — there are no cloud GitHub Actions on push. Merging to `main` triggers an automatic Dokploy build and deploy to production, so please make sure the above is green before requesting review.
