# Postmortem — Elevated 5xx after release `a1b2c3d`

> Sample/worked example. Replace with a real incident after the Week 8 drill.
> **Blameless:** we describe what the system allowed to happen, not who typed what.

| | |
|---|---|
| **Date** | 2026-09-14 |
| **Duration** | 11 minutes (14:02–14:13 IST) |
| **Severity** | SEV-2 — degraded, not total outage |
| **Author** | — |
| **Status** | Resolved |

---

## Impact

- ~38% of requests to `/` returned HTTP 500 for 11 minutes
- `/health` continued returning 200 — **the health check did not detect the fault**
- No data loss

---

## Timeline (IST)

| Time | Event |
|---|---|
| 14:00 | PR #42 merged to `main`; CI green; `push-to-ecr` publishes `a1b2c3d` |
| 14:02 | Deploy completes. Error rate begins climbing |
| 14:05 | CloudWatch alarm `error-rate-high` fires → SNS email |
| 14:06 | Engineer acknowledges, begins investigating |
| 14:09 | Logs show `TypeError: Cannot read properties of undefined` in the request handler |
| 14:10 | Decision: roll back rather than fix forward |
| 14:11 | Lambda alias `live` repointed to previous version |
| 14:13 | Error rate returns to baseline. Incident closed |

**Time to detect: 3 min. Time to recover: 2 min after decision.**

---

## Root cause

The release introduced a response field derived from an optional upstream
value. Local tests and CI used fixtures where that value was always present,
so the undefined branch was never exercised. In production a subset of
requests lacked the field, throwing inside the handler.

`/health` returns a static payload and does not exercise the request path, so
it stayed green throughout — the load balancer saw a healthy instance serving
errors.

---

## Why our safeguards did not catch it

| Safeguard | Why it missed |
|---|---|
| Unit tests | Fixtures only covered the happy path |
| Lint | Not a static-analysis-detectable fault |
| Container smoke test | Only checks `/health`, not `/` |
| Health check | Static response, decoupled from real request handling |

The pattern: **every layer tested the path that worked.**

---

## What went well

- Alarm fired within 3 minutes — detection worked
- SHA-tagged images made "last known good" unambiguous
- Alias rollback took under 60 seconds
- Runbook was followed; no improvisation under pressure

## What went poorly

- A green `/health` masked a broken service
- The smoke test gave false confidence
- No canary stage — the bad release went to 100% of traffic instantly

---

## Action items

| # | Action | Type | Owner | Status |
|---|---|---|---|---|
| 1 | Smoke test `GET /` in addition to `/health` in CI | Detect | — | Todo |
| 2 | Add a test case with the optional field absent | Prevent | — | Todo |
| 3 | Make `/health` exercise the real handler path | Detect | — | Todo |
| 4 | Add weighted alias shifting (10% → 100%) so a bad release hits few users | Mitigate | — | Todo |
| 5 | Alarm on error *rate* per deployment, not absolute count | Detect | — | Todo |

Actions are concrete and owned. "Be more careful" is not an action item.

---

## Lessons

1. **A health check that does not exercise real code paths is theatre.** It answers "is the process alive?", not "is the service working?"
2. **Fast rollback beats fast diagnosis.** Recovery took 2 minutes because the decision was pre-made in the runbook.
3. **Immutable SHA tags turn rollback into a lookup**, not an archaeology exercise.
4. **Canary deployment would have reduced blast radius** from 38% of requests to roughly 4%.
