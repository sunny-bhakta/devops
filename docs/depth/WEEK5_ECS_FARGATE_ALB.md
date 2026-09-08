# Week 5 — Deploy to ECS Fargate + ALB (Staging)

This is the single source of truth for Week 5 execution, checklist, and
definition of done.

Region for project resources: **`ap-south-1` (Mumbai)**

Prerequisites:

- Week 4 completed in [`WEEK4_AWS_SETUP.md`](./WEEK4_AWS_SETUP.md)
- Teardown process ready in [`TEARDOWN_RUNBOOK.md`](./TEARDOWN_RUNBOOK.md)

---

## Week 5 app hardening prep (already implemented in code)

- [x] Graceful shutdown on `SIGTERM` / `SIGINT` with drain + forced timeout
  - `src/graceful-shutdown.js`
- [x] Readiness vs liveness split
  - `/ready` returns `503` while draining
  - `/health` stays cheap and returns `200` while process is alive
  - `src/index.js`
- [x] Structured JSON logging (zero dependencies)
  - `src/index.js`
- [x] Request IDs generated or propagated from `x-request-id`
  - `src/index.js`
- [x] Validated, frozen config (fail fast on bad `PORT`)
  - `src/runtime-config.js`
- [x] Crash safety for `unhandledRejection` and `uncaughtException`
  - `src/crash-safety.js`
- [x] Version stamping with `APP_VERSION` in logs and `/health`
  - `src/index.js`
- [x] Error containment (generic `500`, no stack traces to clients)
  - `src/index.js`
- [x] Keep-alive tuning (`keepAliveTimeout` above common ALB idle timeout)
  - `src/index.js`
- [x] Docker entrypoint uses `CMD ["node", ...]` (not `npm start`)
  - `Dockerfile`

---

## Week 5 deploy path — ECS Fargate + ALB

Deliverables:

- [ ] Provision minimal infrastructure (CDK/Terraform):
  - [ ] VPC with **public subnets only** (no NAT Gateway)
  - [ ] ECS cluster + service (0.25 vCPU / 0.5 GB)
  - [ ] ALB + target group + health checks
  - [ ] ACM certificate for HTTPS
- [ ] Deploy current image to staging.
  - [ ] Destroy the stack before ending the session.
  - [ ] Deploy a deliberately broken image; watch ALB health checks reject it.
  - [ ] Perform a blue/green target-group switch.
  - [ ] Trigger auto-scaling under a `k6` / `autocannon` load test.
  - [ ] Let a CloudWatch alarm fire on real traffic.
  - [ ] Screenshot each of the above **as it happens**.

Definition of done:

- [ ] Staging URL is reachable over HTTPS.
- [ ] Health checks stable.
- [ ] Evidence captured in `docs/images/`.
- [ ] Teardown verified — no ALB, no NAT Gateway, no running tasks left.
