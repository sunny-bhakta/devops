# Load Test Baseline Template

Use this file to record repeatable baseline results before and after major app or infra changes.

## Purpose

- Capture a stable baseline (throughput, latency, errors).
- Compare deltas after code/infrastructure changes.
- Keep one evidence trail for interview discussion.

## Test metadata

| Field | Value |
|---|---|
| Date | 2026-09-03 |
| Tester | |
| Commit SHA | |
| App version (`APP_VERSION`) | |
| Environment | local |
| Endpoint tested | `/health` |
| Tool | autocannon |
| Duration | 30s |
| Concurrency | 50 |
| Notes | Command: `npx autocannon -d 30 -c 50 http://localhost:3000/health` |

---

## Baseline runs

### Run 1

| Metric | Value |
|---|---|
| Requests/sec (avg) | 1,724.44 |
| Bytes/sec (avg) | 550 kB |
| Latency p50 | 18 ms |
| Latency p95 | ~118 ms (from 97.5th percentile) |
| Latency p99 | 152 ms |
| Non-2xx responses | not reported |
| Timeouts/errors | not reported |
| Total served | ~52k requests in 30.06s, 16.5 MB read |

### Run 2

| Metric | Value |
|---|---|
| Requests/sec (avg) | 1,586.44 |
| Latency p50 | 21 ms |
| Latency p95 | ~115 ms (from 97.5th percentile) |
| Latency p99 | 145 ms |
| Non-2xx responses | not reported |
| Timeouts/errors | not reported |

### Run 3

| Metric | Value |
|---|---|
| Requests/sec (avg) | |
| Latency p50 | |
| Latency p95 | |
| Latency p99 | |
| Non-2xx responses | |
| Timeouts/errors | |

---

## Summary (median of runs)

| Metric | Baseline |
|---|---|
| Requests/sec | 1,724.44 |
| Latency p95 | ~118 ms |
| Error rate | not reported |

## Comparison against previous baseline

| Metric | Previous | Current | Delta |
|---|---|---|---|
| Requests/sec | | | |
| Latency p95 | | | |
| Error rate | | | |

## Pass/fail criteria (optional)

- No increase in error rate.
- p95 latency change within acceptable range.
- Throughput does not regress unexpectedly.

## Evidence

- Screenshot / output file path:
- Related PR:

## Quick interpretation

- This is a solid local `/health` baseline at concurrency 50.
- Throughput is ~1.7k req/s with p99 latency at 152 ms.
- Next useful comparison: run the same test against `/` and compare p95/p99 + error rate.

## Run 1 vs Run 2 delta (`/health` vs `/`)

- Throughput: `1,724.44` → `1,586.44` req/s (about **8.0% lower** on `/`).
- p50 latency: `18 ms` → `21 ms` (about **16.7% higher** on `/`).
- p99 latency: `152 ms` → `145 ms` (slightly lower on `/` in this run).
- Total served on `/`: about **48k requests in ~30s**, no explicit error summary reported.
