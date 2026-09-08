# Week 2 — Code Quality + Faster Feedback

This is the single source of truth for Week 2 execution details.

## Deliverables

- [x] Add lint script and include in CI.
  - `eslint.config.js` (flat config, ESLint 9, CommonJS + Node globals)
  - Scripts: `npm run lint`, `npm run lint:fix`
  - CI step: **Run lint** (fails the PR on any lint error)
- [x] Add caching in CI (npm cache via `actions/setup-node`).
- [x] Add test coverage output.
  - `npm run test:coverage` → `node --test --experimental-test-coverage`
  - No extra dependency needed; coverage table prints in the CI log
- [x] Run `npm install` locally to pull ESLint, then verify `npm run lint` passes.
- [x] Confirm CI is green with the three new steps.

## Definition of done

- [x] CI runtime reduces after cache warm-up (compare run #1 vs run #2).
- [x] Coverage summary is visible in the CI log for every PR.
- [x] A lint error blocks the merge.

## Local commands

```bat
npm install
npm run lint
npm run test:coverage
```
