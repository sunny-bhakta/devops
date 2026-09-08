# DevOps Learning Plan (CI/CD + AWS) for This JavaScript Repo

## Repo facts (source of truth)

| Item | Current value |
|---|---|
| Language | Plain JavaScript (ESM/CJS, no TypeScript build yet) |
| Entry point | `src/index.js` |
| Tests | `test/index.test.js` using built-in `node --test` |
| Scripts | `start`, `lint`, `lint:fix`, `build`, `test`, `test:coverage` in `package.json` |
| Lint | ESLint 9 flat config (`eslint.config.js`) |
| Container | `Dockerfile` (multi-stage, `node:20-alpine`, non-root) + `compose.yaml` |
| CI workflow | `.github/workflows/ci.yml` |
| CI jobs | `build-and-test` (required check), `docker-build` |
| Node version | `>=20` (CI pins `20`) |

> Note: `npm run build` today is a syntax-check placeholder (`node --check`). It exists so CI has a real build gate; replace it with a bundler/`tsc` step if the project adds one.

## Goal

In 8 weeks, you should be able to:

- Build a production-style CI pipeline for this repo.
- Containerize and deploy the app to AWS.
- Add safe deployment controls (approval, rollback, health checks).
- Explain architecture and trade-offs at a senior level.

## Prerequisites (do these before Week 1)

- [ ] Git installed and repo pushed to GitHub
- [ ] Node.js 20+ installed locally
- [ ] GitHub account with Actions enabled on the repo
- [ ] AWS account created (needed from Week 4)
- [ ] Docker Desktop installed (needed from Week 3)
- [ ] Decide IaC tool: AWS CDK **or** Terraform (don't mix)


## Progress Tracker

Use this table for quick weekly status updates.

| Week | Focus | Status | Completion |
|---|---|---|---|
| Week 1 | CI Fundamentals | Done | 100% |
| Week 2 | Code Quality + Faster Feedback | Done | 100% |
| Week 3 | Dockerize the app | In progress | 80% |
| Week 4 | AWS Foundation + ECR | Not started | 0% |
| Week 5 | Deploy to ECS Fargate (Staging) | Not started | 0% |
| Week 6 | Secrets + Configuration + Security | Not started | 0% |
| Week 7 | Safe Production Delivery | Not started | 0% |
| Week 8 | Observability + Incident Drill | Not started | 0% |

## What plan should you use?

Use this combo for learning:

- **GitHub Free** for source + Actions (make the repo **public** → unlimited free Actions minutes).
- **AWS pay-as-you-go with strict budget alerts** (this plan assumes **no free tier**).
- **Docker Desktop** locally.
- **Terraform OR AWS CDK** (pick one; don't mix initially).

> Recommendation: Start with **AWS CDK (TypeScript)** — it gives you typed infra and reuses your JS/Node toolchain. Choose Terraform instead only if your target job market demands it.

## Budget mode (no free tier) — read this first

Full cost playbook: [`COST_CONTROL.md`](./COST_CONTROL.md)

Target: finish all 8 weeks for **$0–5 total**.

Three rules:

1. **Never create a NAT Gateway** (~$32/mo) and never leave an **ALB** running (~$17/mo).
2. **Default to the serverless path** — Lambda + Function URL instead of ECS Fargate + ALB.
   Lambda's 1M requests/month is an *always-free* tier, so it applies even without a new account.
3. **Destroy everything at the end of every session** (`cdk destroy --all` / `terraform destroy`).

Do this before creating any AWS resource:

- [ ] Create a **zero-spend budget** alert (Billing → Budgets → *Zero spend budget* template)
- [ ] Create a second budget at **$5/month** with 50/80/100% alerts
- [ ] Enable **Cost Explorer**
- [ ] Tag every resource `project=devops-learning`, `env=dev`

| Path | Weeks 4–8 monthly cost |
|---|---|
| Serverless (Lambda + Function URL) — **recommended** | ~$0 |
| ECS Fargate + ALB, destroyed after each session | ~$0.10 |
| ECS Fargate + ALB left running | **$25–35** ← avoid |

## Success Contract

By the end, you must have:

1. CI checks on pull requests (`build`, `test`, and lint if added).
2. Docker image build + push to ECR.
3. Staging deployment to ECS Fargate (or Lambda if you choose serverless).
4. Production gate with manual approval + rollback strategy documented.
5. Basic monitoring with CloudWatch alarms.

## Do we need server/proxy/reverse proxy/Nginx/load balancer/HTTPS?

Short answer: **not all at once**. Start with the minimum production-safe stack.

| Component | Needed now? | Why | Budget-mode recommendation |
|---|---|---|---|
| App server (Node.js process) | Yes | Runs your API/app | **Lambda function** (pay per request) |
| HTTPS (TLS) | Yes | Security + browser trust + production baseline | **Free** with Lambda Function URL |
| Load balancer | Only for ECS | Routing + health checks + safe scaling | Skip in budget mode (~$17/mo) |
| Reverse proxy | Yes (conceptually) | Routes client requests to app | Function URL provides this |
| Nginx | Optional | Advanced custom routing/caching when self-managed | Skip initially |
| Forward proxy | No | Outbound traffic control in enterprise networks | Not required |
| NAT Gateway | **No** | Private subnet egress | **Never create** (~$32/mo) |

### Minimal recommended architecture (budget mode)

- Lambda Function URL (HTTPS + routing, no ALB)
- Lambda function running the Node.js app
- CloudWatch (logs with 7-day retention, metrics, 1 alarm)
- Route 53 only if you want a custom domain (~$0.50/mo per hosted zone)

### Full "enterprise-shaped" architecture (for one timeboxed exercise)

- Route 53 (DNS)
- ALB (HTTPS termination + reverse proxy + load balancing)
- ECS Fargate service (your Node.js container)
- CloudWatch (logs, metrics, alarms)

Build this once, screenshot it, then destroy it. It covers senior-level deployment
fundamentals — but it is the expensive path, so it should never stay running.

## 8-Week Roadmap (Hands-on)

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
- [ ] Keep exactly one CI workflow file — **delete the stale `app-ci.yml`**:
      `del ".github\workflows\app-ci.yml"`
- [x] Add a CI status badge to the root `README.md` (replace `<OWNER>`/`<REPO>`).

Remaining cleanup (cosmetic, does not block Week 2):

- [ ] Delete `.github/workflows/app-ci.yml` (currently every PR runs two workflows).
- [ ] Replace `<OWNER>`/`<REPO>` in the root `README.md` badge.
- [ ] Save evidence screenshots into `docs/images/`.

Definition of done:

- [x] PR fails if tests/build fail.
- [x] A green PR can be merged safely.
- [x] Direct pushes to `main` are blocked.

### Week 1 evidence screenshots

Store screenshots under `docs/images/` and update filenames below as needed.

- Branch protection rule configured on `main`:
  ![Week 1 - Branch protection rule](./images/week1-branch-protection.png)
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

- [ ] `docker-build` job is green on a PR.
- [ ] Smoke test confirms `/health` returns 200 from inside the container.
- [ ] Image contains no dev dependencies (ESLint absent from the runtime stage).

Optional local commands (not required — CI does this for you):

```bat
docker compose up --build
curl http://localhost:3000/health
docker compose down
```

### Week 4 — AWS Foundation + ECR

Deliverables:

- [ ] Create AWS account guardrails:
  - [ ] Zero-spend budget alarm
  - [ ] $5/month budget alarm with 50/80/100% alerts
  - [ ] Cost Explorer enabled
  - [ ] IAM user/role strategy
- [ ] Create **one** ECR repo and push image from CI.
- [ ] Add an ECR **lifecycle policy** to keep only the latest 2 images.

Definition of done:

- [ ] Merging to `main` publishes tagged image to ECR.
- [ ] ECR storage stays under ~200 MB (cost ≈ $0.02/mo).

### Week 5 — Deploy to the cloud (Staging)

Pick **one** path. Budget mode → choose Path A.

#### Path A — Serverless (recommended, ~$0)

Deliverables:

- [ ] Provision with CDK/Terraform:
  - [ ] Lambda function running the app handler
  - [ ] Lambda **Function URL** (HTTPS included, no ALB, no cert to manage)
  - [ ] CloudWatch log group with 7-day retention
- [ ] Deploy current build to staging.

#### Path B — ECS Fargate + ALB (timeboxed session only, ~$0.10 per session)

Deliverables:

- [ ] Provision minimal infrastructure (CDK/Terraform):
  - [ ] VPC with **public subnets only** (no NAT Gateway)
  - [ ] ECS cluster + service (0.25 vCPU / 0.5 GB)
  - [ ] ALB + target group + health checks
  - [ ] ACM certificate for HTTPS
- [ ] Deploy current image to staging.
- [ ] **Destroy the stack before ending the session.**

Definition of done:

- [ ] Staging URL is reachable over HTTPS.
- [ ] Health checks stable.
- [ ] Teardown verified — no ALB, no NAT Gateway, no running tasks left.

### Week 6 — Secrets + Configuration + Security

Deliverables:

- [ ] Move sensitive values to **SSM Parameter Store (Standard tier — free)**.
      Avoid Secrets Manager unless you need rotation ($0.40 per secret/month).
- [ ] Tighten IAM permissions for pipeline and runtime roles.
- [ ] Add dependency vulnerability scan in CI (`npm audit` — free).

Definition of done:

- [ ] No plaintext secrets in repo.
- [ ] Runtime and CI roles follow least privilege.

### Week 7 — Safe Production Delivery

Deliverables:

- [ ] Add production workflow with manual approval (GitHub **Environments** → required reviewers, free).
- [ ] Choose deployment strategy:
  - [ ] Path A: **Lambda alias + weighted traffic shifting** (blue/green, costs $0)
  - [ ] Path B: ECS rolling or blue/green (only during a timeboxed session)
- [ ] Document rollback runbook in `docs/ROLLBACK_RUNBOOK.md`.

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
- [ ] Run one simulated incident and write `docs/POSTMORTEM_SAMPLE.md`.

Definition of done:

- [ ] You can detect, diagnose, and recover from a bad release.
- [ ] Total monthly observability cost stays under ~$0.20.

## Senior-Level Concepts to Practice While Building

- Trunk-based development vs GitFlow trade-offs.
- Artifact versioning and immutable deployments.
- Health checks and auto rollback triggers.
- Idempotent infra changes.
- Cost visibility (tagging + budgets).

## Cost-Safe Learning Checklist (Important)

Full detail: [`COST_CONTROL.md`](./COST_CONTROL.md)

Before provisioning:

- [ ] Zero-spend budget + $5 budget alerts created
- [ ] Cost Explorer enabled
- [ ] Tags planned: `project=devops-learning`, `env=dev/staging`

While building:

- [ ] Prefer serverless (Lambda) over always-on compute
- [ ] Smallest instance/task sizes only
- [ ] **No NAT Gateway** — public subnets only
- [ ] **No always-on ALB**
- [ ] SSM Parameter Store (free) over Secrets Manager
- [ ] Log retention set to 7 days
- [ ] Public GitHub repo → free unlimited Actions minutes

End of every session (teardown):

- [ ] `cdk destroy --all` or `terraform destroy`
- [ ] No ALBs, NAT Gateways, or running ECS tasks
- [ ] No unattached Elastic IPs or `available` EBS volumes
- [ ] ECR holds ≤ 2 images
- [ ] Check Cost Explorer for today's spend

## Portfolio Output (for interviews)

By the end, publish these artifacts in this repo:

1. CI workflow file under `.github/workflows/` (done: `ci.yml`).
2. `Dockerfile` + `.dockerignore`.
3. `infra/` folder with CDK/Terraform code.
4. `docs/ROLLBACK_RUNBOOK.md`.
5. `docs/POSTMORTEM_SAMPLE.md`.
6. `docs/BRANCH_PROTECTION_GUIDE.md` (done).
7. `docs/COST_CONTROL.md` (done).
8. `docs/images/` evidence screenshots.

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
| Dependency vulnerability scan | Yes | Week 6 |
| Approval gate + rollback | Yes | Week 7 |
| Monitoring, alarms, postmortem | Yes | Week 8 |
| HTTPS/TLS certificate | Yes | Week 5 (Function URL, or ACM on ALB) |
| Cost guardrails | Yes | Week 4 + `COST_CONTROL.md` |
| Running without a free tier | Yes | Budget mode + `COST_CONTROL.md` |
| Local dev parity | Partial | Week 3 (container run) |
| Load/performance testing | Not covered | Optional stretch goal |
| Multi-environment promotion (dev→staging→prod) | Partial | Weeks 5 + 7 |

### Optional stretch goals (after Week 8)

- [ ] Add a basic load test (`autocannon` / `k6`) and record baseline latency.
- [ ] Add automated dependency updates (Dependabot/Renovate).
- [ ] Add SBOM generation and image scanning in CI.
- [ ] Add infrastructure drift detection in CI.

## Weekly working rhythm

1. Read the week's deliverables.
2. Do the work on a feature branch.
3. Open a PR and let CI validate it.
4. Tick the checkboxes and update the Progress Tracker.
5. Save a screenshot as evidence in `docs/images/`.
