# Maturity Gap Analysis

Full backlog of CI/CD + DevOps practices for this repo.
`[x]` done · `[ ]` open · `~~struck~~` deliberately out of scope.

## Layer 1 — Source control & collaboration

- [x] Trunk-based development
- [x] Branch protection / required status checks
- [x] Block force pushes
- [ ] Conventional commit messages (commitlint)
- [ ] `.github/CODEOWNERS`
- [ ] `.github/pull_request_template.md`
- [ ] `.github/ISSUE_TEMPLATE/`
- [ ] Signed commits

## Layer 2 — Build & test

- [x] Automated build
- [x] Unit tests
- [x] Integration tests (real server boot)
- [x] Lint
- [x] Coverage measured
- [ ] Coverage threshold enforced (`--test-coverage-lines=80`)
- [ ] Code formatting (Prettier + `format:check`)
- ~~Contract tests~~ (no consumers)
- ~~Mutation testing~~ (low return here)

## Layer 3 — Supply chain security

- [ ] Dependency audit (`npm audit`)
- [ ] Container image scan (Trivy)
- [ ] SBOM generation (CycloneDX)
- [ ] SAST (CodeQL)
- [ ] Secret scanning (Gitleaks, full history)
- [ ] Automated dependency updates (Dependabot)
- [x] Lockfile integrity (`npm ci`)
- [ ] Pin all actions to commit SHAs
- [ ] Image signing (Cosign)
- [ ] Build provenance / SLSA attestation

## Layer 4 — Artifacts & versioning

- [ ] Immutable SHA image tags
- [ ] ECR tag immutability
- [ ] ECR lifecycle policy
- [ ] Semantic versioning
- [ ] Changelog generation
- [ ] GitHub Releases

## Layer 5 — Infrastructure as Code

- [ ] Choose IaC tool (CDK)
- [ ] Infra committed to version control
- [ ] `synth`/`plan` on PR
- [ ] Remote state with locking
- [ ] Drift detection (scheduled)
- [ ] Policy as code (Checkov / `cdk-nag`)
- [ ] Cost estimation on PR (Infracost)

## Layer 6 — Deployment

- [ ] Rollback runbook
- [ ] Zero-downtime capable (graceful shutdown + `/ready`)
- [ ] Automated deploy
- [ ] Environment separation (staging → prod)
- [ ] GitHub Environments + required reviewers
- [ ] Deploy concurrency guard
- [ ] Progressive delivery / canary
- [ ] Automated rollback on alarm
- ~~Feature flags~~ (overkill for one endpoint)

## Layer 7 — Observability

- [ ] Structured JSON logs
- [ ] Request correlation IDs
- [ ] Version stamped in logs
- [ ] Liveness + readiness probes
- [ ] RED metrics (Rate, Errors, Duration)
- [ ] Dashboards
- [ ] Alarms → SNS notification
- [ ] Log retention set to 7 days
- [ ] Distributed tracing (OpenTelemetry / X-Ray)
- [ ] SLOs + error budget
- [ ] Synthetic monitoring

## Layer 8 — Operations & culture

- [ ] Rollback runbook
- [ ] Blameless postmortem template
- [ ] Incident drill
- [ ] DORA metrics (deploy frequency, lead time, MTTR, change failure rate)
- [ ] Architecture Decision Records (`docs/adr/`)
- ~~On-call rotation~~ (solo project)
- ~~Chaos engineering~~ (drill covers the learning)

## Layer 9 — Performance & cost

- [ ] Cost guardrails documented
- [x] CI caching (npm + Docker layers)
- [ ] Budget alarms
- [ ] Resource tagging
- [ ] Load test baseline (p50/p95/p99)
- [ ] Right-sizing review

## Priority order

Quick wins (cloud-free, ~30 min):

- [ ] Pin all actions to commit SHAs
- [ ] Enforce coverage threshold
- [ ] `CODEOWNERS` + PR template
- [ ] Deploy concurrency guard
- [ ] Prettier + `format:check`

Next:

- [ ] Release automation (semver + changelog)
- [ ] Cosign signing + provenance
- [ ] Load test baseline
- [ ] ADRs for decisions already made

Then resume roadmap: Week 4 → 5 → 6 → 7 → 8

Advanced (after Week 8):

- [ ] OpenTelemetry tracing
- [ ] SLOs + error budget
- [ ] DORA metrics
- [ ] Drift detection
- [ ] Policy as code
- [ ] Infracost

> Judgement matters more than the checklist. Being able to explain *why* you
> skipped something is a stronger signal than adding it without reason.
