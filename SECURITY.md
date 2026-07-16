# Security Policy

Thank you for helping keep **Camera Angle Guide Pro** (framepilot) and its users safe.

## Supported versions

Camera Angle Guide Pro is a continuously deployed web application — the live site at
https://frame-pilot.rahmanef.com always tracks the latest release from `main`. We
provide security fixes only for the current release line.

| Version | Supported |
| --- | --- |
| `0.1.0` (current) | :white_check_mark: |
| Older / pre-release | :x: |

Because deploys are automatic on merge to `main`, the most effective fix is always
against the latest code.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests, or discussions.**

Instead, use **GitHub's private vulnerability reporting**:

1. Go to the repository's **Security** tab:
   https://github.com/rahmanef63/framepilot/security
2. Click **"Report a vulnerability"** to open a private advisory.
3. Provide as much detail as you can (see below).

This keeps the report private between you and the maintainers until a fix is
ready and coordinated disclosure can happen.

### What to include

- A clear description of the vulnerability and its impact.
- Step-by-step reproduction (affected route, e.g. `/`, `/library`, `/template`,
  `/panduan`, `/admin`, `/docs`; request/response details; a proof-of-concept if
  possible).
- Affected browser/device where relevant (the app is mobile-heavy).
- Any suggested remediation.

Please do **not** include third-party secrets, live credentials, or details about
unrelated infrastructure in your report.

## Our commitment

- We will acknowledge your report as promptly as we can.
- We will keep you informed of progress toward a fix.
- We will credit you in the advisory once resolved, unless you prefer to remain
  anonymous.

## Scope and safe harbor

In scope: the application code in this repository and the deployed web app.

Out of scope: denial-of-service testing, social engineering, physical attacks,
and any testing that could degrade the service or access other users' data.
Please act in good faith, only test against accounts and data you own, and avoid
privacy violations. Do not attempt to extract, publish, or exploit deployment
secrets or backend infrastructure details.

We will not pursue action against researchers who follow this policy and report
in good faith.
