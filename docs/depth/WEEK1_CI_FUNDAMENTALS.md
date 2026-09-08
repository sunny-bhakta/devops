# Week 1 — CI Fundamentals for this repo

This is the single source of truth for Week 1 execution and evidence.

## Deliverables

- [x] Add GitHub Actions workflow for:
  - [x] Install dependencies
  - [x] `npm run build`
  - [x] `npm test`
- [x] Enable branch protection on `main` requiring passing checks.
  - Step-by-step UI walkthrough: [`BRANCH_PROTECTION_GUIDE.md`](./BRANCH_PROTECTION_GUIDE.md)
  - Required status check name for this repo: `build-and-test` (from `.github/workflows/ci.yml`)
  - Configured via **Rulesets**, targeting the default branch, enforcement `Active`.
- [ ] Save evidence screenshots into `docs/images/`.

## Definition of done

- [x] PR fails if tests/build fail.
- [x] A green PR can be merged safely.
- [x] Direct pushes to `main` are blocked.

## Evidence screenshots

Store screenshots under `docs/images/` and update filenames below as needed.

- PR/check run showing failed build/test:
  ![Week 1 - Failed CI check](../images/week1-ci-failed.png)
- PR/check run showing passing build/test:
  ![Week 1 - Passed CI check](../images/week1-ci-passed.png)
