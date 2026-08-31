# DevOps Learning Plan (CI/CD + AWS) for This JavaScript Repo

## Goal

In 8 weeks, you should be able to:

- Build a production-style CI pipeline for this repo.
- Containerize and deploy the app to AWS.
- Add safe deployment controls (approval, rollback, health checks).
- Explain architecture and trade-offs at a senior level.

## Progress Tracker

Use this table for quick weekly status updates.

| Week | Focus | Status | Completion |
|---|---|---|---|
| Week 1 | CI Fundamentals | In progress | 70% |
| Week 2 | Code Quality + Faster Feedback | Not started | 0% |
| Week 3 | Dockerize the app | Not started | 0% |
| Week 4 | AWS Foundation + ECR | Not started | 0% |
| Week 5 | Deploy to ECS Fargate (Staging) | Not started | 0% |
| Week 6 | Secrets + Configuration + Security | Not started | 0% |
| Week 7 | Safe Production Delivery | Not started | 0% |
| Week 8 | Observability + Incident Drill | Not started | 0% |

## What plan should you use?

Use this combo for learning:

- **GitHub Free** for source + Actions.
- **AWS Free Tier** (with strict budget alerts).
- **Docker Desktop** locally.
- **Terraform OR AWS CDK** (pick one; don't mix initially).

> Recommendation: Start with **AWS CDK (TypeScript)** since your codebase is TypeScript-heavy.

## Success Contract

By the end, you must have:

1. CI checks on pull requests (`build`, `test`, and lint if added).
2. Docker image build + push to ECR.
3. Staging deployment to ECS Fargate (or Lambda if you choose serverless).
4. Production gate with manual approval + rollback strategy documented.
5. Basic monitoring with CloudWatch alarms.

## Do we need server/proxy/reverse proxy/Nginx/load balancer/HTTPS?

Short answer: **not all at once**. Start with the minimum production-safe stack.

| Component | Needed now? | Why | Recommended for this plan |
|---|---|---|---|
| App server (Node.js process) | Yes | Runs your API/app | Run in ECS Fargate task/container |
| HTTPS (TLS) | Yes | Security + browser trust + production baseline | Use ACM certificate on ALB |
| Load balancer | Yes (for ECS service) | Routing + health checks + safe scaling/deployments | Use AWS ALB |
| Reverse proxy | Yes (conceptually) | Routes client requests to app containers | ALB already provides this |
| Nginx | Optional | Useful for advanced custom routing/caching when self-managed | Skip initially; add as advanced topic |
| Forward proxy | No (for most app deployments) | Usually for outbound traffic control in enterprise networks | Not required in initial learning path |

### Minimal recommended architecture for your roadmap

- Route 53 (DNS)
- ALB (HTTPS termination + reverse proxy + load balancing)
- ECS Fargate service (your Node.js container)
- CloudWatch (logs, metrics, alarms)

This covers senior-level deployment fundamentals without extra complexity.

## 8-Week Roadmap (Hands-on)

### Week 1 — CI Fundamentals for this repo

Deliverables:

- [x] Add GitHub Actions workflow for:
  - [x] Install dependencies
  - [x] `npm run build`
  - [x] `npm test`
- [ ] Enable branch protection on `main` requiring passing checks.

Definition of done:

- [ ] PR fails if tests/build fail.
- [ ] A green PR can be merged safely.

### Week 2 — Code Quality + Faster Feedback

Deliverables:

- [ ] Add lint script (if not present) and include in CI.
- [ ] Add caching in CI (node modules/package manager cache).
- [ ] Add test coverage output.

Definition of done:

- [ ] CI runtime reduces after cache warm-up.
- [ ] Team can see coverage trend in PRs.

### Week 3 — Dockerize the app

Deliverables:

- [ ] Create `Dockerfile` for production build.
- [ ] Add `.dockerignore`.
- [ ] Run app locally from container.

Definition of done:

- [ ] Image builds successfully.
- [ ] App starts from container without local TS tooling.

### Week 4 — AWS Foundation + ECR

Deliverables:

- [ ] Create AWS account guardrails:
  - [ ] Budget alarm
  - [ ] IAM user/role strategy
- [ ] Create ECR repo and push image from CI.

Definition of done:

- [ ] Merging to `main` publishes tagged image to ECR.

### Week 5 — Deploy to ECS Fargate (Staging)

Deliverables:

- [ ] Provision minimal infrastructure (CDK/Terraform):
  - [ ] VPC (or reuse default for learning)
  - [ ] ECS cluster + service
  - [ ] ALB + target group + health checks
- [ ] Deploy current image to staging.

Definition of done:

- [ ] Staging URL is reachable.
- [ ] Health checks stable.

### Week 6 — Secrets + Configuration + Security

Deliverables:

- [ ] Move sensitive values to AWS Secrets Manager/SSM Parameter Store.
- [ ] Tighten IAM permissions for pipeline and runtime roles.
- [ ] Add dependency vulnerability scan in CI.

Definition of done:

- [ ] No plaintext secrets in repo.
- [ ] Runtime and CI roles follow least privilege.

### Week 7 — Safe Production Delivery

Deliverables:

- [ ] Add production workflow with manual approval.
- [ ] Choose deployment strategy:
  - [ ] Rolling (simple), or
  - [ ] Blue/Green (preferred for learning senior-level operations)
- [ ] Document rollback runbook.

Definition of done:

- [ ] Failed deploy can be rolled back quickly and predictably.

### Week 8 — Observability + Incident Drill

Deliverables:

- [ ] CloudWatch dashboard for key metrics:
  - [ ] Request count
  - [ ] Error rate
  - [ ] Latency
  - [ ] CPU/memory (for ECS)
- [ ] Alarm notifications (email/SNS).
- [ ] Run one simulated incident and write a short postmortem.

Definition of done:

- [ ] You can detect, diagnose, and recover from a bad release.

## Senior-Level Concepts to Practice While Building

- Trunk-based development vs GitFlow trade-offs.
- Artifact versioning and immutable deployments.
- Health checks and auto rollback triggers.
- Idempotent infra changes.
- Cost visibility (tagging + budgets).

## Cost-Safe Learning Checklist (Important)

- Enable AWS budget alerts before provisioning resources.
- Prefer smallest instance/task sizes.
- Destroy unused stacks each day.
- Avoid NAT Gateway unless necessary (can be costly).
- Track resources with tags: `project=langraph-code-agent`, `env=dev/staging`.

## Portfolio Output (for interviews)

By the end, publish these artifacts in this repo:

1. CI workflow file under `.github/workflows/`.
2. `Dockerfile` + `.dockerignore`.
3. `infra/` folder with CDK/Terraform code.
4. `devops/ROLLBACK_RUNBOOK.md`.
5. `devops/POSTMORTEM_SAMPLE.md`.

If you can explain *why* you chose each design, you're operating at senior level.

## Optional next step in this repo

If you want, next I can scaffold all starter files for Week 1 in one go:

- `.github/workflows/ci.yml`
- basic lint setup
- CI-ready README section with badge
