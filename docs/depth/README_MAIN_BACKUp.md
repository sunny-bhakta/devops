# Archived Backup (Do Not Use)

This file is kept only as historical backup content.

Use active docs instead:

- Main roadmap: [`docs/README.md`](../README.md)
- Cost policy: [`COST_CONTROL.md`](./COST_CONTROL.md)
- Week 4 execution: [`WEEK4_AWS_SETUP.md`](./WEEK4_AWS_SETUP.md)

## How to use this guide

1. Follow week-by-week in order.
2. Tick checkboxes only after you complete the task yourself.
3. Keep evidence screenshots in `docs/images/` as you progress.

Related references:

- Inventory of ahead-of-schedule work: [`COMPLETED_AHEAD.md`](./COMPLETED_AHEAD.md)
- Full maturity backlog: [`MATURITY_GAP_ANALYSIS.md`](./MATURITY_GAP_ANALYSIS.md)

## Quick navigation

- [Prerequisites](#prerequisites-do-these-before-week-1)
- [Progress Tracker](#progress-tracker)
- [Cost mode and guardrails](#pick-your-cost-mode--read-this-first)
- [Success Contract](#success-contract)
- [Architecture choices](#do-we-need-serverproxyreverse-proxynginxload-balancerhttps)
- [Phase 1 (Weeks 1-8)](#phase-1--depth-weeks-18)
- [Phase 2 (Weeks 9-12)](#phase-2--breadth-weeks-912)
- [Cost-Safe Learning Checklist](#cost-safe-learning-checklist-important)
- [Portfolio Output](#portfolio-output-for-interviews)
- [Coverage check](#coverage-check-is-anything-missing)
- [AWS-free tasks](#what-can-be-done-without-an-aws-account)
- [Glossary](#glossary)
- [Weekly working rhythm](#weekly-working-rhythm)

## Prerequisites (do these before Week 1)

- [ ] Git installed and repo pushed to GitHub
- [ ] Node.js 20+ installed locally
- [ ] GitHub account with Actions enabled on the repo
- [ ] AWS account created on the **Free plan** (needed from Week 4)
- [ ] Docker Desktop installed (needed from Week 3)
- [ ] Decide IaC tool: AWS CDK **or** Terraform (don't mix)

## Progress Tracker

Use this table for quick weekly status updates.

| Week | Focus | Status | Completion |
|---|---|---|---|
| Week 1 | CI Fundamentals | Done | 100% |
| Week 2 | Code Quality + Faster Feedback | Done | 100% |
| Week 3 | Dockerize the app | Done | 100% |
| Week 4 | AWS Foundation + ECR | Not started | 0% |
| Week 5 | Deploy to ECS Fargate + ALB (Staging) | Not started | 0% |
| Week 6 | Secrets + Configuration + Security | Not started | 0% |
| Week 7 | Safe Production Delivery | Not started | 0% |
| Week 8 | Observability + Incident Drill | Not started | 0% |
| Week 9 | Kubernetes locally (Kind) | Not started | 0% |
| Week 10 | Terraform (same infra, second tool) | Not started | 0% |
| Week 11 | Prometheus + Grafana | Not started | 0% |
| Week 12 | Networking deep-dive + interview prep | Not started | 0% |

Weeks 1–8 are **Phase 1 (depth)** — one app taken properly to production.
Weeks 9–12 are **Phase 2 (breadth)** — Kubernetes, Terraform, Prometheus.
Phase 2 runs entirely locally at $0.

## What plan should you use?

Use this combo for learning:

- **GitHub Free** for source + Actions (make the repo **public** → unlimited free Actions minutes).
- **AWS new-account Free plan** with credits — see *Pick your cost mode* below.
- **Docker Desktop** locally.
- **Terraform OR AWS CDK** (pick one; don't mix initially).

> Recommendation: Start with **AWS CDK (TypeScript)** — it gives you typed infra and reuses your JS/Node toolchain. Choose Terraform instead only if your target job market demands it.

## Pick your cost mode — read this first

Full cost playbook: [`COST_CONTROL.md`](./COST_CONTROL.md)

Two variants of the same 12-week plan. The weeks, deliverables and definitions
of done are identical; only the Week 5 deployment path and the guardrail
posture differ.

- [ ] **Mode A — Budget mode** *(free tier expired, real money from resource one)*
- [x] **Mode B — Credit mode** *(new AWS account with sign-up credits)* ← **active**

Mode B is active. Mode A stays documented as the fallback for when credits run
out — at that point every Mode A rule applies again immediately.

| | Mode A — Budget | Mode B — Credit |
|---|---|---|
| Account | Free tier expired | New account with credits |
| Account plan | Paid | **Free plan** recommended |
| Budget | $0–5 real money | $0 out of pocket; credits absorb it |
| At the limit | You get billed | Account restricted, no charge |
| Week 5 path | **Path A** (Lambda + Function URL) | **Path B viable** (ECS Fargate + ALB) |
| Staging lifetime | Destroy every session | Can stay up for days |
| ALB (~$17/mo) | Avoid | Acceptable, still tear down |
| NAT Gateway (~$32/mo) | **Never** | **Never** |
| Main risk | Surprise charge | Credit expiry cliff |


Why Free plan first:

- It makes overspending **structurally impossible**, not just unlikely. That is
  a stronger guarantee than any budget alert.
- Your entire 12-week plan fits inside 6 months with room to spare.
- Phase 2 (Weeks 9–12) is local, so it is unaffected either way.

The trade-off — read this before choosing:

- **Account restriction is abrupt.** When credits run out, resources stop
  rather than bill. Take screenshots as you go; do not leave evidence-gathering
  until the end.
- Some services are unavailable or capped on the Free plan. Everything this
  plan needs (ECR, ECS Fargate, Lambda, ALB, CloudWatch, SSM, IAM) is
  available, but **verify before relying on it**.
- If you later want to keep a portfolio environment running, you must upgrade
  to the Paid plan — at which point every Mode A rule applies immediately.

> Switching Free → Paid is easy. Recovering from a surprise bill is not. Start
> restricted.

### Shared rules (both modes)

1. **Never create a NAT Gateway** (~$32/mo). No learning value at any budget.
2. **Destroy everything at the end of every session** (`cdk destroy --all` /
   `terraform destroy`). Credits do not make forgotten resources free — they
   just delay the invoice.
3. **Set both budgets anyway.** Credits mask spend until they run out, after
   which billing is silent and immediate.

Do this before creating any AWS resource:

- [ ] Create a **zero-spend budget** alert (Billing → Budgets → *Zero spend budget* template)
- [ ] Create a second budget at **$5/month** with 50/80/100% alerts
- [ ] Enable **Cost Explorer**
- [ ] Tag every resource `project=devops-learning`, `env=dev`

### Mode A — Budget mode (fallback, when credits run out)

Target: finish Phase 1 (Weeks 1–8) for **$0–5 total**.

- [ ] Default to the **serverless path** — Lambda + Function URL, not ECS + ALB.
      Lambda's 1M requests/month is *Always Free*, so it applies without a new
      account.
- [ ] Never leave an **ALB** running (~$17/mo).
- [ ] Treat Week 5 Path B as a single timeboxed exercise: build, screenshot,
      destroy.

| Path | Weeks 4–8 monthly cost |
|---|---|
| Serverless (Lambda + Function URL) — **recommended** | ~$0 |
| ECS Fargate + ALB, destroyed after each session | ~$0.10 |
| ECS Fargate + ALB left running | **$25–35** ← avoid |

### Mode B — Credit mode (ACTIVE)

Target: **$0 out of pocket**, and zero running resources when credits expire.

Record these at sign-up:

| Field | Value |
|---|---|
| Account plan (Free / Paid) | `______________` |
| Credit amount | `______________` |
| Credit expiry date | `______________` |
| Reminder set for expiry − 2 weeks | `[ ]` |

What credits unlock — genuinely hard to learn in a 30-minute session:

- [ ] Leave staging (ECS Fargate + ALB) running for a few days.
- [ ] Watch ALB health checks reject a bad deploy in real time.
- [ ] Do a real blue/green target-group switch.
- [ ] Trigger auto-scaling under a `k6` / `autocannon` load test.
- [ ] Let CloudWatch alarms fire on actual traffic.
- [ ] Run a private repo without worrying about Actions minutes *(still prefer
      public — unlimited and free)*.

Credit-specific guardrails:

- [ ] Calendar reminder at **expiry minus 2 weeks**
- [ ] Track credit burn weekly in Billing → Credits
- [ ] Still tag and still tear down — an ALB left up for six months quietly
      consumes $100
- [ ] **Full teardown before credits expire** (also listed in Week 8)
- [ ] Know the Mode A fallback rules for the day credits run out

> The risk in Mode B is not overspending — it is *forgetting*. Most surprise
> AWS bills come from resources created during a credit period and never
> deleted. When credits run out, fall back to Mode A rules.

## Success Contract

By the end, you must have:

1. CI checks on pull requests (`build`, `test`, and lint if added).
2. Docker image build + push to ECR.
3. Staging deployment to ECS Fargate behind an ALB (Mode B), or Lambda (Mode A).
4. Production gate with manual approval + rollback strategy documented.
5. Basic monitoring with CloudWatch alarms.
6. Screenshots in `docs/images/` proving each of the above ran — captured
   *before* the account is torn down or restricted.

## Do we need server/proxy/reverse proxy/Nginx/load balancer/HTTPS?

Short answer: **not all at once**. Start with the minimum production-safe stack.

| Component | Needed now? | Why | Recommendation |
|---|---|---|---|
| App server (Node.js process) | Yes | Runs your API/app | **Mode B:** ECS Fargate task. **Mode A:** Lambda |
| HTTPS (TLS) | Yes | Security + browser trust + production baseline | ACM cert on ALB, or free with Function URL |
| Load balancer | Yes in Mode B | Routing + health checks + safe scaling | **Mode B:** ALB (~$17/mo on credits). **Mode A:** skip |
| Reverse proxy | Yes (conceptually) | Routes client requests to app | ALB listener rules, or Function URL |
| Nginx | Optional | Advanced custom routing/caching when self-managed | Skip initially |
| Forward proxy | No | Outbound traffic control in enterprise networks | Not required |
| NAT Gateway | **No** | Private subnet egress | **Never create** (~$32/mo), both modes |

### Mode B architecture (active — credits absorb the ALB)

- Route 53 only if you want a custom domain (~$0.50/mo per hosted zone)
- **ALB** (HTTPS termination + reverse proxy + load balancing)
- **ECS Fargate** service running your container
- CloudWatch (logs with 7-day retention, metrics, alarms)

This is the enterprise-shaped stack. Building it is the point of Week 5 —
health checks, target groups and blue/green only exist here. Screenshot it as
you go, because on the Free plan it disappears when credits run out.

### Mode A architecture (fallback — no ALB)

- Lambda Function URL (HTTPS + routing, no ALB)
- Lambda function running the Node.js app
- CloudWatch (logs with 7-day retention, metrics, 1 alarm)
- Route 53 only if you want a custom domain

Same concepts, different price. Blue/green becomes a Lambda alias with weighted
traffic shifting; health checks become CloudWatch alarms on the alias.

## Phase 1 — Depth (Weeks 1–8)

### Week 1 — CI Fundamentals for this repo

Deliverables:

- [x] Add GitHub Actions workflow for:
  - [x] Install dependencies
  - [x] `npm run build`
  - [x] `npm test`
- [x] Enable branch protection on `main` requiring passing checks.
  - Step-by-step UI walkthrough: [`BRANCH_PROTECTION_GUIDE.md`](./BRANCH_PROTECTION_GUIDE.md)
  - Required status check name for this repo: `build-and-test` (from `.github/workflows/ci.yml`)
  - Configured via **Rulesets**, targeting the default branch, enforcement `Active`.

- [ ] Save evidence screenshots into `docs/images/`.

Definition of done:

- [x] PR fails if tests/build fail.
- [x] A green PR can be merged safely.
- [x] Direct pushes to `main` are blocked.

### Week 1 evidence screenshots

Store screenshots under `docs/images/` and update filenames below as needed.

- PR/check run showing failed build/test:
  ![Week 1 - Failed CI check](./images/week1-ci-failed.png)
- PR/check run showing passing build/test:
  ![Week 1 - Passed CI check](./images/week1-ci-passed.png)

### Week 2 — Code Quality + Faster Feedback

Deliverables:

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

Definition of done:

- [x] CI runtime reduces after cache warm-up (compare run #1 vs run #2).
- [x] Coverage summary is visible in the CI log for every PR.
- [x] A lint error blocks the merge.

Local commands:

```bat
npm install
npm run lint
npm run test:coverage
```

### Week 3 — Dockerize the app

Deliverables:

- [x] Create `Dockerfile` for production build.
  - Multi-stage: `deps` (via `npm ci --omit=dev`) → `runtime`
  - Base image `node:20-alpine`, runs as non-root `USER node`
  - Built-in `HEALTHCHECK` hitting `/health`
- [x] Add `.dockerignore` (excludes `node_modules`, `.git`, `docs`, `test`, coverage).
- [x] Run app from a container — **verified in CI, no local Docker needed**.
  - New `docker-build` job in `ci.yml`: builds the image, starts it,
    polls `GET /health` until 200, prints image size, then cleans up.
- [x] Add `compose.yaml` for optional one-command local runs.

Definition of done:

- [x] `docker-build` job is green on a PR.
- [x] Smoke test confirms `/health` returns 200 from inside the container.
- [x] Image contains no dev dependencies (ESLint absent from the runtime stage).

Optional local commands (not required — CI does this for you):

```bat
docker compose up --build
curl http://localhost:3000/health
docker compose down
```

### Weeks 4–8 run on AWS — read this once

Weeks 1–3 were local and repeatable. Weeks 4–8 are not:

- On the **Free plan**, the account is restricted when credits run out —
  environments stop existing, and you cannot recreate them for screenshots.
- On the **Paid plan**, they keep billing instead.

Two habits for every cloud week:

- [ ] **Screenshot as you go**, into `docs/images/`. Evidence gathered after
      teardown is evidence you do not have.
- [ ] **Write the rollback/teardown step before the create step.** If you
      cannot undo it, do not create it.

### Week 4 — AWS Foundation + ECR

**Region: `ap-south-1` (Mumbai).** Full walkthrough: [`WEEK4_AWS_SETUP.md`](./WEEK4_AWS_SETUP.md)

> ⚠️ **Mode B (active):** credits absorb the cost, but the expiry date is a
> hard cliff. On the Free plan the account is then restricted; on the Paid plan
> forgotten resources bill silently. Guardrails go in before any resource is
> created.

Deliverables:

- [ ] Create AWS account guardrails:
  - [ ] Zero-spend budget alarm
  - [ ] $5/month budget with 50/80/100% alerts
  - [ ] Cost Explorer enabled
  - [ ] IAM strategy: **GitHub OIDC role, no long-lived access keys**
- [ ] Create **one** ECR repo (`devops-nodejs-app`) with tag immutability + scan on push.
- [ ] Add an ECR **lifecycle policy** to keep only the latest 2 images.
- [ ] Set GitHub Actions variables: `AWS_REGION`, `AWS_ROLE_ARN`, `ECR_REPOSITORY`.
- [ ] Add `push-to-ecr` CI job (main-only, OIDC, SHA + `latest` tags).

Definition of done:

- [ ] Merging to `main` publishes a SHA-tagged image to ECR.
- [ ] No AWS access keys stored in GitHub secrets.
- [ ] ECR storage stays under ~200 MB (cost ≈ $0.02/mo).
- [ ] Cost Explorer shows < $0.10 for the month.

### Week 5 — Deploy to the cloud (Staging)

Pick **one** path.
**Mode B is active → take Path B.** It costs credits rather than cash, and
teaches load balancing, health checks and blue/green properly. Path A stays
here as the Mode A fallback.

#### Week 5 app hardening prep (already implemented in code)

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

#### Path A — Serverless (Mode A fallback, ~$0)

Deliverables:

- [ ] Provision with CDK/Terraform:
  - [ ] Lambda function running the app handler
  - [ ] Lambda **Function URL** (HTTPS included, no ALB, no cert to manage)
  - [ ] CloudWatch log group with 7-day retention
- [ ] Deploy current build to staging.

#### Path B — ECS Fargate + ALB (recommended in Mode B)

**Mode B:** can stay up for days on credits — take advantage of that.
**Mode A:** timeboxed session only, ~$0.10 per session.

Deliverables:

- [ ] Provision minimal infrastructure (CDK/Terraform):
  - [ ] VPC with **public subnets only** (no NAT Gateway)
  - [ ] ECS cluster + service (0.25 vCPU / 0.5 GB)
  - [ ] ALB + target group + health checks
  - [ ] ACM certificate for HTTPS
- [ ] Deploy current image to staging.
- [ ] **Mode A:** destroy the stack before ending the session.
- [ ] **Mode B only** — things a long-lived staging environment makes possible:
  - [ ] Deploy a deliberately broken image; watch ALB health checks reject it
  - [ ] Perform a blue/green target-group switch
  - [ ] Trigger auto-scaling under a `k6` / `autocannon` load test
  - [ ] Let a CloudWatch alarm fire on real traffic
  - [ ] Screenshot each of the above **as it happens**

Definition of done:

- [ ] Staging URL is reachable over HTTPS.
- [ ] Health checks stable.
- [ ] Evidence captured in `docs/images/`.
- [ ] Teardown verified — no ALB, no NAT Gateway, no running tasks left.

### Week 6 — Secrets + Configuration + Security

Deliverables:

- [ ] Move sensitive values to **SSM Parameter Store (Standard tier — free)**.
      Avoid Secrets Manager unless you need rotation ($0.40 per secret/month).
      *(needs AWS)*
- [ ] Tighten IAM permissions for pipeline and runtime roles. *(needs AWS)*
- [ ] Add dependency vulnerability scan in CI — `.github/workflows/security.yml`:
  - [ ] `npm audit` (fails on high/critical in production deps)
  - [ ] Trivy image scan (fails on HIGH/CRITICAL, `ignore-unfixed`)
  - [ ] SBOM generated in CycloneDX format and uploaded as an artifact
  - [ ] CodeQL static analysis
  - [ ] Gitleaks secret scanning across full git history
  - [ ] Weekly scheduled run to catch newly-disclosed CVEs
- [ ] Automated dependency updates via `.github/dependabot.yml` (npm, Actions, Docker).

Optional third-party scanners:

- [ ] **Snyk** — `snyk-scan` job in `security.yml`. Free for public repos
      (100 tests/month otherwise). Needs a `SNYK_TOKEN` secret.
      *Overlaps `npm audit`/Trivy/CodeQL, but adds concrete upgrade paths,
      transitive-dependency traces and licence compliance. Widely named in job
      descriptions, so worth the keyword.*
- [ ] **GitGuardian** — `ggshield` action. Free up to 25 developers.
      *Straight overlap with Gitleaks, which already scans full history.
      Adds a dashboard and better false-positive handling. Resume value only —
      no security gain on a solo repo. Skip unless you want the name.*
- ~~**Datadog**~~ — **do not add during this plan.**
      *No free tier; $15–31/host/month after a 14-day trial, and your AWS
      credits do not cover third-party SaaS. Week 11 covers the same ground
      with Prometheus + Grafana at $0, and Prometheus is the open standard
      Datadog itself ingests. For APM specifically, OpenTelemetry is the
      vendor-neutral equivalent. Learn Datadog on an employer's licence.*

Target scanner coverage by end of Week 6:

| Layer | Tool |
|---|---|
| Dependencies | `npm audit` (+ Snyk, optional) |
| Container image | Trivy |
| Source code (SAST) | CodeQL |
| Secrets | Gitleaks (+ GitGuardian, optional) |
| SBOM | Trivy CycloneDX |

Definition of done:

- [ ] No plaintext secrets in repo (verified by the Gitleaks job).
- [ ] Runtime and CI roles follow least privilege.
- [ ] You can explain what each scanner catches that the others do not.

### Week 7 — Safe Production Delivery

Deliverables:

- [ ] Add production workflow with manual approval (GitHub **Environments** → required reviewers, free).
- [ ] Choose deployment strategy:
  - [ ] **Mode B (active): ECS blue/green** — two target groups, real traffic
        switch, health-check-gated. This is the version worth demonstrating.
  - [ ] Mode A fallback: **Lambda alias + weighted traffic shifting** (costs $0)
- [ ] Document rollback runbook in [`ROLLBACK_RUNBOOK.md`](./ROLLBACK_RUNBOOK.md).
- [ ] Screenshot the blue/green switch **while it is happening** — it cannot be
      recreated after teardown.

Definition of done:

- [ ] Failed deploy can be rolled back quickly and predictably.
- [ ] Rollback is a single documented command/click.

### Week 8 — Observability + Incident Drill

Deliverables:

- [ ] CloudWatch dashboard using **built-in metrics only** (custom metrics cost $0.30 each/mo):
  - [ ] Request count
  - [ ] Error rate
  - [ ] Latency
  - [ ] Concurrency (Lambda) or CPU/memory (ECS)
- [ ] **One** alarm + SNS email notification.
- [ ] Set log group retention to **7 days** (default is "never expire" and bills forever).
- [ ] Postmortem template ready: [`POSTMORTEM_SAMPLE.md`](./POSTMORTEM_SAMPLE.md).
- [ ] Run one simulated incident and write up the real postmortem.
- [ ] Screenshot the dashboard and the firing alarm before teardown.

Definition of done:

- [ ] You can detect, diagnose, and recover from a bad release.
- [ ] Total monthly observability cost stays under ~$0.20.
- [ ] **Mode B:** full teardown scheduled before credits expire.
- [ ] All AWS evidence saved in `docs/images/` — the account can now be
      restricted or closed without losing your portfolio.

## Phase 2 — Breadth (Weeks 9–12)

Weeks 1–8 build **depth**: one app taken properly to production. Phase 2 adds
the **breadth** that resume screens filter on — Kubernetes, Terraform, and the
Prometheus/Grafana stack.

Rules that keep this cheap and coherent:

- Same repo, same app, same image. Nothing is rebuilt from scratch.
- Everything runs **locally** — Kind and Docker Compose, no managed clusters.
- Terraform targets infrastructure you have already modelled in CDK, so you
  learn the *concepts* rather than a second syntax.

> **Ansible is deliberately excluded.** It manages mutable VMs — the problem
> containers already solved. Add it only if a job you are targeting names it.

### Week 9 — Kubernetes locally (Kind)

Cost: $0. Never create an EKS cluster for learning (~$73/month for the control
plane alone).

Deliverables:

- [ ] Install Kind (or Minikube) and create a single-node cluster.
- [ ] Load your existing image into the cluster (`kind load docker-image`).
- [ ] Write `k8s/` manifests:
  - [ ] `Deployment` with 2 replicas, resource requests/limits
  - [ ] `Service` (ClusterIP) + `Ingress`
  - [ ] `ConfigMap` for `PORT` / `LOG_LEVEL`
  - [ ] `Secret` (understand that it is base64, **not** encryption)
  - [ ] Liveness + readiness probes wired to `/health` and `/ready`
- [ ] Perform a rolling update and watch pods cycle.
- [ ] Roll back with `kubectl rollout undo`.
- [ ] Add `kubectl apply --dry-run=server` validation to CI.

Definition of done:

- [ ] You can explain Pod vs Deployment vs Service vs Ingress in your own words.
- [ ] You can explain why readiness probes make rolling updates safe.
- [ ] A bad image is caught by the readiness probe and traffic never shifts.

### Week 10 — Terraform (same infra, second tool)

Terraform appears in far more job descriptions than CDK. Reimplementing infra
you already understand teaches state, providers and the plan/apply loop
without also having to learn a new target.

Deliverables:

- [ ] `infra-tf/` — providers, resources, variables, outputs.
- [ ] Reimplement the Week 5 stack (Lambda + Function URL + log group).
- [ ] Remote state in S3 + DynamoDB lock table *(or local state to stay at $0)*.
- [ ] Extract one reusable module.
- [ ] Run `terraform plan` on PRs touching `infra-tf/`; post the plan as a comment.
- [ ] `terraform destroy` at the end of every session.

Definition of done:

- [ ] You can explain what state is and why it must be locked.
- [ ] You can explain Terraform vs CDK vs CloudFormation trade-offs.
- [ ] You can explain why Terraform is not a replacement for Ansible — and why
      containers make that comparison mostly obsolete.

### Week 11 — Prometheus + Grafana

CloudWatch is AWS's dialect; Prometheus is the industry's vocabulary. Runs
locally at $0.

Deliverables:

- [ ] Expose `/metrics` from the app (`prom-client`, or hand-rolled text format).
- [ ] Emit RED metrics: request rate, error rate, duration histogram.
- [ ] `compose.observability.yaml` — app + Prometheus + Grafana.
- [ ] Prometheus scrape config targeting the app.
- [ ] Grafana dashboard: rate, errors, p50/p95/p99 latency.
- [ ] One alert rule (error rate > 5% for 5 minutes).
- [ ] Load test with `autocannon`/`k6` and watch the dashboard move.

Definition of done:

- [ ] You can explain pull vs push metric collection.
- [ ] You can explain counters vs gauges vs histograms.
- [ ] You can explain why p99 matters more than an average.
- [ ] You have a recorded latency baseline for the app.

### Week 12 — Networking deep-dive + interview prep

Deliverables:

- [ ] Networking fundamentals, written up in your own words:
  - [ ] What actually happens when you type a URL into a browser
  - [ ] DNS resolution, TCP handshake, TLS handshake
  - [ ] Public vs private subnets, route tables, Internet Gateway, NAT
  - [ ] Security Group vs NACL (stateful vs stateless)
  - [ ] Why `0.0.0.0` and not `127.0.0.1` inside a container
- [ ] Write `docs/ARCHITECTURE.md` — diagram + rationale for every choice.
- [ ] Write ADRs for decisions already made (`docs/adr/`).
- [ ] Rehearse the answers below out loud.

Interview questions to be able to answer *without notes*:

- [ ] Container vs VM
- [ ] Pod vs Deployment vs Service
- [ ] Terraform vs CDK vs Ansible
- [ ] Public vs private subnet; Security Group vs NACL
- [ ] What CI/CD actually buys you
- [ ] How you deploy with zero downtime
- [ ] How you roll back a bad release
- [ ] How you monitor a production application
- [ ] Why you use OIDC instead of AWS access keys
- [ ] What an SBOM is and why it matters
- [ ] Why you skipped Ansible / EKS / feature flags
- [ ] Why you chose Prometheus over Datadog

Definition of done:

- [ ] You can walk someone through the whole repo in 10 minutes.
- [ ] Every significant decision has a *why* you can defend.

### What Phase 2 deliberately leaves out

- ~~Ansible~~ — mutable-VM configuration management; containers replaced it.
- ~~Jenkins~~ — GitHub Actions covers the same concepts; add only if required.
- ~~Managed Kubernetes (EKS/GKE)~~ — ~$73/month control plane for zero extra learning.
- ~~Service mesh (Istio/Linkerd)~~ — a solution to a scale problem you do not have.
- ~~Datadog / New Relic~~ — paid APM. Prometheus + Grafana (Week 11) and
  OpenTelemetry cover the concepts at $0, and are vendor-neutral.

## Senior-Level Concepts to Practice While Building

- Trunk-based development vs GitFlow trade-offs.
- Artifact versioning and immutable deployments.
- Health checks and auto rollback triggers.
- Idempotent infra changes.
- Cost visibility (tagging + budgets).

## Cost-Safe Learning Checklist (Important)

Full detail: [`COST_CONTROL.md`](./COST_CONTROL.md)

Before provisioning:

- [ ] Cost mode chosen (A — budget, or B — credit)
- [ ] Zero-spend budget + $5 budget alerts created
- [ ] Cost Explorer enabled
- [ ] Tags planned: `project=devops-learning`, `env=dev/staging`
- [ ] **Mode B:** credit expiry date recorded + calendar reminder set

While building:

- [ ] **Mode A:** prefer serverless (Lambda) over always-on compute
- [ ] Smallest instance/task sizes only
- [ ] **No NAT Gateway** — public subnets only (both modes)
- [ ] **Mode A:** no always-on ALB
- [ ] SSM Parameter Store (free) over Secrets Manager
- [ ] Log retention set to 7 days
- [ ] Public GitHub repo → free unlimited Actions minutes
- [ ] **Mode B:** check credit burn weekly

End of every session (teardown):

- [ ] `cdk destroy --all` or `terraform destroy`
- [ ] No ALBs, NAT Gateways, or running ECS tasks
- [ ] No unattached Elastic IPs or `available` EBS volumes
- [ ] ECR holds ≤ 2 images
- [ ] Check Cost Explorer for today's spend
- [ ] **Mode B:** confirm nothing will outlive the credits

## Portfolio Output (for interviews)

By the end, publish these artifacts in this repo:

1. CI workflow file under `.github/workflows/` (done: `ci.yml`).
2. `Dockerfile` + `.dockerignore` (done).
3. `infra/` folder with CDK/Terraform code.
4. `docs/ROLLBACK_RUNBOOK.md`.
5. `docs/POSTMORTEM_SAMPLE.md`.
6. `docs/BRANCH_PROTECTION_GUIDE.md` (done).
7. `docs/COST_CONTROL.md` (done).
8. `docs/WEEK4_AWS_SETUP.md`.
9. `docs/images/` evidence screenshots.
10. `k8s/` manifests (Week 9).
11. `infra-tf/` Terraform code (Week 10).
12. `docs/ARCHITECTURE.md` + `docs/adr/` (Week 12).
13. `docs/GLOSSARY.md` (done).

If you can explain *why* you chose each design, you're operating at senior level.

## Coverage check (is anything missing?)

| Area | Covered in plan? | Where |
|---|---|---|
| Build + test in CI | Yes | Week 1 |
| Merge protection / PR gate | Yes | Week 1 |
| Lint + coverage + caching | Yes | Week 2 |
| Containerization | Yes | Week 3 |
| Artifact registry (ECR) | Yes | Week 4 |
| Cloud runtime + load balancer | Yes | Week 5 |
| Secrets management | Yes | Week 6 |
| Dependency vulnerability scan | Yes | Week 6 (`security.yml`) |
| Container image scanning + SBOM | Yes | Week 6 (Trivy) |
| Static analysis (SAST) | Yes | Week 6 (CodeQL) |
| Secret scanning | Yes | Week 6 (Gitleaks) |
| Third-party scanners (Snyk / GitGuardian) | Optional | Week 6 |
| Automated dependency updates | Yes | `dependabot.yml` |
| Approval gate + rollback | Yes | Week 7 |
| Monitoring, alarms, postmortem | Yes | Week 8 |
| HTTPS/TLS certificate | Yes | Week 5 (Function URL, or ACM on ALB) |
| Cost guardrails | Yes | Week 4 + `COST_CONTROL.md` |
| Running without a free tier | Yes | Mode A + `COST_CONTROL.md` |
| Running on sign-up credits | Yes | Mode B |
| Local dev parity | Partial | Week 3 (container run) |
| Load/performance testing | Yes | Week 11 |
| Multi-environment promotion (dev→staging→prod) | Partial | Weeks 5 + 7 |
| Kubernetes | Yes | Week 9 |
| Terraform hands-on | Yes | Week 10 |
| Prometheus + Grafana | Yes | Week 11 |
| Networking fundamentals | Yes | Week 12 |

### Optional stretch goals (after Week 12)

- [ ] Add a basic load test (`autocannon` / `k6`) and record baseline latency.
- [ ] Add infrastructure drift detection in CI.
- [ ] Add OpenTelemetry tracing.
- [ ] Define an SLO and error budget.

## What can be done without an AWS account

Roughly half the remaining work needs no cloud and costs nothing:

| Task | Week |
|---|---|
| Dependency audit, image scan, SBOM, SAST, secret scan | 6 |
| Automated dependency updates | 6 |
| Rollback runbook | 7 |
| Postmortem template | 8 |
| App hardening (graceful shutdown, structured logs, env config) | 5 prep |
| Load testing baseline | Stretch |
| Write IaC and validate with `cdk synth` / `terraform validate` (no credentials needed) | 5 |

Only these genuinely require AWS: ECR push, Lambda/ECS deploy, SSM parameters,
CloudWatch dashboards and alarms.

## Glossary

Short definitions for every acronym in this plan. Full detail:
[`GLOSSARY.md`](./GLOSSARY.md)

### AWS

| Term | Stands for | What it is |
|---|---|---|
| **ECR** | Elastic Container Registry | Private Docker image storage. Where CI pushes images and compute pulls them |
| **ECS** | Elastic Container Service | Runs containers. Decides what runs where, restarts failures |
| **Fargate** | — | Serverless mode for ECS. No servers to patch; you pay per task |
| **EKS** | Elastic Kubernetes Service | Managed Kubernetes. ~$73/mo control plane — **skipped**, use Kind locally |
| **Lambda** | — | Run code per request, scale to zero. Always Free: 1M requests/mo |
| **ALB** | Application Load Balancer | HTTPS entry point, routes traffic, health-checks targets. ~$17/mo |
| **VPC** | Virtual Private Cloud | Your private network in AWS |
| **NAT Gateway** | Network Address Translation | Lets private subnets reach the internet. ~$32/mo — **never create** |
| **IAM** | Identity and Access Management | Who can do what. Users, roles, policies |
| **OIDC** | OpenID Connect | Keyless auth. GitHub proves its identity, AWS issues temporary credentials |
| **SSM** | Systems Manager | Parameter Store holds config/secrets. Standard tier is free |
| **ACM** | AWS Certificate Manager | Free TLS certificates for the ALB |
| **CloudWatch** | — | Logs, metrics, dashboards, alarms |
| **SNS** | Simple Notification Service | Sends the alarm email |
| **S3** | Simple Storage Service | Object storage. Used for Terraform remote state |
| **CDK** | Cloud Development Kit | Infrastructure as code in TypeScript |

### CI/CD and delivery

| Term | Stands for | What it is |
|---|---|---|
| **CI** | Continuous Integration | Every change is built and tested automatically |
| **CD** | Continuous Delivery/Deployment | Every green change is deployable / deployed |
| **IaC** | Infrastructure as Code | Infrastructure defined in files, not clicked in a console |
| **Blue/green** | — | Run old and new side by side, switch traffic, switch back to roll back |
| **Canary** | — | Send a small % of traffic to the new version first |
| **Artifact** | — | The built thing you deploy. Here: the container image |
| **Immutable tag** | — | A tag that can never be overwritten, so a deploy is traceable to one commit |

### Security

| Term | Stands for | What it is |
|---|---|---|
| **SAST** | Static Application Security Testing | Scans source code for vulnerabilities (CodeQL) |
| **SBOM** | Software Bill of Materials | Machine-readable list of everything in your image |
| **CVE** | Common Vulnerabilities and Exposures | A publicly catalogued vulnerability |
| **Trivy** | — | Scans container images for known CVEs |
| **Gitleaks** | — | Scans git history for committed secrets |
| **CycloneDX** | — | An SBOM file format |
| **SLSA** | Supply-chain Levels for Software Artifacts | Standard for proving how an artifact was built |

### Observability

| Term | Stands for | What it is |
|---|---|---|
| **RED** | Rate, Errors, Duration | The three metrics that matter for a request-serving service |
| **p50 / p95 / p99** | percentiles | 99% of requests were faster than p99. Averages hide the slow tail |
| **SLO** | Service Level Objective | A target you commit to, e.g. 99.5% of requests under 300ms |
| **Liveness** | — | "Is the process alive?" Fails → restart it |
| **Readiness** | — | "Can it take traffic *right now*?" Fails → stop routing, don't restart |
| **OTel** | OpenTelemetry | Vendor-neutral standard for traces and metrics |
| **MTTR** | Mean Time To Recovery | How long from breakage to fixed |
| **DORA** | DevOps Research and Assessment | Four metrics: deploy frequency, lead time, MTTR, change failure rate |

### Kubernetes (Week 9)

| Term | What it is |
|---|---|
| **Pod** | One or more containers scheduled together. The smallest unit |
| **Deployment** | Keeps N copies of a Pod running; handles rolling updates |
| **Service** | Stable network address for a set of Pods |
| **Ingress** | HTTP routing from outside the cluster |
| **ConfigMap** | Non-secret config |
| **Secret** | Config that is base64-encoded — **not encrypted** |
| **Kind** | Kubernetes in Docker. A free local cluster |
| **kubectl** | The CLI |

### Node.js / tooling

| Term | What it is |
|---|---|
| **npm ci** | Clean install from the lockfile. Reproducible; use in CI |
| **Lockfile** | `package-lock.json` — pins exact resolved versions |
| **Multi-stage build** | Build in one image, copy only what runs into a smaller final image |
| **Dependabot** | Opens PRs when dependencies have updates |
| **ESLint** | Finds bugs and style problems in JavaScript |

# Archived Backup

This file is intentionally archived and not maintained.

Use these active docs instead:

- Main roadmap: [`docs/README.md`](../README.md)
- Cost guardrails: [`COST_CONTROL.md`](./COST_CONTROL.md)
- Week 4 execution runbook: [`WEEK4_AWS_SETUP.md`](./WEEK4_AWS_SETUP.md)

> Kept only for historical reference.
