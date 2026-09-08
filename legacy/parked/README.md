# Archived parked code

This folder contains the old Week 5 reference implementation that used to live in top-level `src/` and `test/` parked files.

## Why this exists

- Keep historical learning/reference code
- Keep active app code in `src/index.js`, `src/graceful-shutdown.js`, `src/runtime-config.js`, and `src/crash-safety.js`
- Reduce clutter in top-level files

## Notes

- Top-level parked files are now lightweight shims pointing here.
- Active npm test scripts do **not** run these archived tests.
