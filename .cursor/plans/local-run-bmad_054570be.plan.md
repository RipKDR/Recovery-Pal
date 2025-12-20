---
name: local-run-bmad
overview: Align BMAD spec for Expo Router web run readiness on Windows (npm).
todos:
  - id: bmad-analyst-prereqs
    content: "Analyst/PM: Context & prereq audit (Node/npm/ports)"
    status: completed
  - id: bmad-deps-install
    content: "PM/SM: Dependency install validation (npm install)"
    status: completed
  - id: bmad-runtime-config
    content: "Architect: Web runtime config (polyfills/env/cache paths)"
    status: completed
  - id: bmad-story-run-web
    content: "Story 1 (SM/Dev): Run `npm run web` smoke vs acceptance"
    status: in_progress
  - id: bmad-story-tests
    content: "Story 2 (SM/Dev): Run `npm test` (jest-expo) and capture results"
    status: pending
---

# Local Run Readiness Plan (BMAD)

## Goal

Bring the Expo Router app (SDK 54) up on web locally with npm on Windows using a BMAD spec-driven flow so prerequisites, runtime config, and acceptance checks are explicit.

## BMAD Context & Roles

- Analyst/PM: capture platform constraints (Windows, Node 18–20, ports 8081/19006 free; Expo SDK 54; npm CLI).
- Architect: ensure web crypto/base64 polyfills are loaded in `app/_layout.tsx`, `app/entry.tsx`, `polyfills.ts/js`; metro cache path is writable; no required secrets beyond optional `EXPO_PUBLIC_SENTRY_DSN`.
- PO: shard scope into Story 1 (web run smoke) and Story 2 (jest-expo tests) for SM/Dev.
- SM/Dev: execute stories against acceptance below; log console/network anomalies.
- Reference: BMAD method overview — https://recruit.group.gmo/engineer/jisedai/blog/the-bmad-method-a-framework-for-spec-oriented-ai-driven-development/

## Artifacts (spec shards)

- PRD shard: `PRD.local-web-readiness.md` — scope, constraints, and success criteria for local web run.
- Architecture note: `ARCH.local-web-runtime.md` — polyfills, env flags, ports, metro cache path.
- Story file: `1.0.local-web-readiness.story.md` (SM/Dev) — acceptance and execution steps below.

## Acceptance Criteria

### Story 1: Run web

- `npm run web` starts Expo dev server on Windows without redboxes; dev UI reachable (Expo web port, typically 19006).
- Home/tabs render via Expo Router; navigation works.
- Browser console has no missing polyfill/crypto/base64 errors; `crypto.subtle`, `atob`, `btoa` available.
- No blocked ports or permission errors; metro cache writes succeed.

### Story 2: Tests

- `npm test` (jest-expo) executes; all suites pass or failing cases are documented with error summary; no missing module/polyfill errors.

## Execution Steps (context-engineered)

1) Context & prerequisites audit (Analyst/PM)

- Confirm Node 18–20 and npm versions on Windows; ensure ports 8081/19006 are free.
- Skim [`twelve-step-companion/README.md`](twelve-step-companion/README.md) and `EAS_SETUP.md` for optional envs.
2) Dependency install validation (PM/SM)
- In `twelve-step-companion`, run `npm install` (package-lock present); capture peer/optional warnings (NativeWind, expo-router, react-native-web).
- Verify `npx expo --version` matches SDK 54; confirm metro cache path writeability.
3) Runtime configuration check (Architect)
- Verify crypto/base64 polyfills are wired in `app/_layout.tsx`, `app/entry.tsx`, `polyfills.ts/js`.
- Ensure optional envs (e.g., `EXPO_PUBLIC_SENTRY_DSN`) default safely; confirm no additional gating secrets.
4) Launch & smoke test (Story 1, SM/Dev)
- Run `npm run web`; confirm acceptance above.
- Spot-check crypto-dependent screens (journal, share/vault) and data stores (Zustand + SQLite web fallback) for console errors.
5) Tests & readiness report (Story 2, SM/Dev)
- Run `npm test` (jest-expo); capture pass/fail output; note blockers.
- Produce short readiness note aligned to BMAD artifacts.

## Risks & Mitigations

- Port conflicts on 8081/19006 → stop competing processes or set Expo to a free port.
- Missing polyfills on web → ensure `crypto`, `atob`, and `btoa` shims load before app in `app/entry.tsx`.
- Optional envs unset → provide safe defaults so telemetry/secrets do not block startup.