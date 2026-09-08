# Glossary

Quick-reference tables live in `README.md`. This file explains *why each thing
exists* — which is what interviews actually probe.

---

## AWS

### ECR — Elastic Container Registry

Private Docker image storage.

**Why it exists:** a GitHub Actions runner is destroyed when the job ends,
taking your built image with it. Something has to hold the image between "CI
built it" and "AWS runs it".

**Why not Docker Hub:** ECR authenticates via IAM, so an ECS task pulls using
its own role — no registry password stored anywhere. It also sits in the same
region as your compute, is private by default, and has no anonymous pull rate
limits.

**Two settings that matter:**

- **Tag immutability** — once `app:abc123` exists it can never be overwritten.
  This is what makes "roll back to yesterday's image" mean something exact.
- **Lifecycle policy** — ECR keeps everything forever at $0.10/GB/mo. Keep 2
  images, expire the rest. Costs ~$0.02/mo.

**Cost:** $0.10/GB/month. Same-region pulls are free.

### ECS — Elastic Container Service

AWS's container orchestrator. Decides which containers run where, restarts
failures, replaces tasks during a deploy.

**vs Kubernetes:** far simpler, AWS-only. Kubernetes is portable and far more
common in job descriptions — which is why Week 9 covers it separately.

### Fargate

A *launch type* for ECS, not a separate service. You give AWS a container and a
CPU/memory size; AWS finds the hardware.

**Why it matters:** without Fargate you manage EC2 instances — patching,
scaling, capacity planning. Fargate removes all of that.

**Cost:** ~$9/mo for 0.25 vCPU / 0.5 GB running continuously.

### EKS — Elastic Kubernetes Service

Managed Kubernetes.

**Deliberately skipped.** The control plane alone is ~$73/month and teaches
nothing that a free local Kind cluster does not. Learn the concepts locally;
learn EKS when an employer is paying.

### Lambda

Runs a function per request. Scales to zero when idle.

**Why it is the budget-mode choice:** 1M requests/month is *Always Free* — not
part of the 12-month tier — so it applies to any account, forever.

**Trade-off:** your app must be a handler, not a long-running server. On GCP,
Cloud Run runs your container unchanged; Lambda needs an adapter.

### ALB — Application Load Balancer

The HTTPS front door. Terminates TLS, routes by path/host, health-checks
targets, and removes unhealthy ones from rotation.

**Why it is the interesting part of Week 5:** health checks, target groups and
blue/green switching *only exist here*. This is where you learn why a deploy
does not drop traffic.

**Cost:** ~$17/month. Fine on credits, avoid on cash.

### VPC — Virtual Private Cloud

Your isolated network. Subnets, route tables, gateways.

- **Public subnet** — has a route to an Internet Gateway
- **Private subnet** — does not; needs a NAT Gateway to reach out

This plan uses **public subnets only**, precisely to avoid the NAT Gateway.

### NAT Gateway

Lets resources in a private subnet make outbound connections.

**Never create one for learning.** ~$32/month plus data processing, and the
concept takes two minutes to understand. It is the single most common way
people accidentally spend real money on AWS.

### IAM — Identity and Access Management

Who can do what.

- **User** — long-lived identity with credentials
- **Role** — identity something *assumes* temporarily
- **Policy** — the permissions document

**Least privilege:** grant only what is needed. Your CI role should push to one
ECR repo, not hold `AdministratorAccess`.

### OIDC — OpenID Connect

How CI authenticates to AWS **without storing credentials**.

1. GitHub issues a short-lived token: *"this is repo X, branch main"*
2. AWS validates it against a trust policy you configured
3. AWS returns temporary credentials, valid ~1 hour

**Why it matters:** leaked long-lived access keys are the most common cloud
breach vector. OIDC removes the class of problem — there is no secret to leak.
Expect this in interviews.

### SSM Parameter Store

Config and secrets storage.

**Standard tier is free.** Secrets Manager costs $0.40 per secret per month and
is only worth it if you need automatic rotation.

### ACM — AWS Certificate Manager

Free TLS certificates, auto-renewing, for use with an ALB.

### CloudWatch

Logs, metrics, dashboards, alarms.

**Two cost traps:**

- Log groups default to **never expire** and bill forever. Set 7-day retention.
- Custom metrics cost $0.30/metric/month. Built-in metrics are free.

### SNS — Simple Notification Service

Pub/sub messaging. Here: the thing that emails you when an alarm fires.

### S3 — Simple Storage Service

Object storage. In this plan, only for Terraform remote state.

### CDK — Cloud Development Kit

Infrastructure as code in a real programming language. Synthesises to
CloudFormation.

**vs Terraform:** CDK is AWS-native and typed. Terraform is multi-cloud and far
more common in job ads. Week 10 does the same infrastructure in Terraform so
you can compare them honestly.

---

## CI/CD and delivery

### CI — Continuous Integration

Every change is automatically built and tested. The point is not automation for
its own sake — it is that broken code **cannot reach the main branch**.

### CD — Continuous Delivery / Deployment

- **Delivery** — every green change is *deployable*; a human triggers it
- **Deployment** — every green change *is deployed*, no human

This plan does Delivery: production requires manual approval.

### IaC — Infrastructure as Code

Infrastructure in version-controlled files rather than console clicks.

**Why:** reviewable in a PR, reproducible, and destroyable in one command —
which is what makes the cost discipline in this plan possible at all.

### Blue/green deployment

Run old (blue) and new (green) simultaneously, switch traffic, keep blue around
briefly.

**Why:** rollback is a traffic switch, not a rebuild. Seconds instead of
minutes.

### Canary deployment

Send a small percentage of traffic to the new version, watch the metrics,
increase gradually. Limits the blast radius of a bad release.

### Artifact

The built thing you deploy. Here, the container image.

**Immutable artifacts** mean the exact bytes tested in CI are the bytes running
in production — no rebuild between environments.

### Immutable tag

A tag that cannot be overwritten.

**Why it matters:** with mutable tags, `app:v1.2` could be different bytes
today than yesterday. Your "rollback" then deploys something you never tested.

---

## Security

### SAST — Static Application Security Testing

Scans source code for vulnerable patterns without running it. CodeQL here.

**vs DAST:** dynamic testing attacks a running app. SAST is cheaper and runs on
every PR.

### SBOM — Software Bill of Materials

A machine-readable inventory of everything inside your artifact.

**Why it suddenly matters:** after Log4Shell, the question "are we affected?"
took organisations weeks to answer. An SBOM makes it a database query.
Increasingly a procurement requirement.

### CVE — Common Vulnerabilities and Exposures

A publicly catalogued vulnerability with an ID like `CVE-2021-44228`.

### Trivy

Scans container images against CVE databases. `ignore-unfixed` skips issues
with no available patch — otherwise the build fails on things you cannot fix.

### Gitleaks

Scans git history for committed secrets.

**Why full history matters:** deleting a secret in a later commit does not
remove it from the repo. It is still there, and still leaked.

### CycloneDX

An SBOM file format. SPDX is the main alternative.

### SLSA — Supply-chain Levels for Software Artifacts

A framework for proving an artifact was built from the source it claims, by the
pipeline it claims. Guards against a compromised build system.

---

## Observability

### RED — Rate, Errors, Duration

The three metrics that matter for anything serving requests:

- **Rate** — requests per second
- **Errors** — how many failed
- **Duration** — how long they took

Cover these and you can answer "is it healthy?" without a dashboard sprawl.

### p50 / p95 / p99

Percentiles. p99 = 99% of requests were faster than this.

**Why not averages:** an average of 100ms can hide 1% of requests taking 10
seconds. Those users are having a terrible time and the average will never
show it.

### SLO — Service Level Objective

A target you commit to, e.g. *99.5% of requests under 300ms over 30 days*.

**Error budget:** the remaining 0.5%. If you have budget left, ship faster. If
you have burned it, stop and fix reliability. It turns "is it reliable enough?"
into a number.

### Liveness vs readiness

Different questions with different consequences:

- **Liveness** — "is the process alive?" Fails → **restart it**
- **Readiness** — "can it take traffic right now?" Fails → **stop routing to
  it, but leave it running**

**Why the distinction matters:** during graceful shutdown you want readiness to
fail so the load balancer drains connections — but *not* liveness, or the
orchestrator kills the process mid-request. Confusing the two causes deploys
that drop traffic.

### OpenTelemetry (OTel)

Vendor-neutral standard for traces, metrics and logs. Instrument once, send
anywhere — Prometheus, Datadog, X-Ray.

**Why it matters:** avoids vendor lock-in at the instrumentation layer.

### MTTR — Mean Time To Recovery

Average time from breakage to restoration.

**Why it beats MTBF:** failures are inevitable. Recovering fast is a more
achievable and more useful goal than never failing.

### DORA metrics

Four measures from the DevOps Research and Assessment programme:

1. **Deployment frequency**
2. **Lead time for changes** — commit to production
3. **Change failure rate**
4. **Time to restore service**

The research finding that matters: speed and stability are **correlated, not
opposed**. Teams that deploy more often also fail less.

---

## Kubernetes (Week 9)

### Pod

One or more containers scheduled together, sharing network and storage. The
smallest deployable unit.

**You rarely create Pods directly** — a Deployment manages them.

### Deployment

Keeps N replicas of a Pod running. Handles rolling updates and rollbacks.

`kubectl rollout undo` is the rollback.

### Service

A stable network name for a changing set of Pods. Pods get new IPs constantly;
the Service does not.

### Ingress

HTTP routing from outside the cluster — the rough equivalent of an ALB.

### ConfigMap and Secret

Non-secret and "secret" configuration.

**Important:** a Kubernetes Secret is **base64-encoded, not encrypted**. Anyone
with read access can decode it. Real secrets need Sealed Secrets, External
Secrets Operator, or a cloud secret store.

### Kind — Kubernetes in Docker

Runs a cluster inside Docker containers. Free, local, disposable — which is why
Week 9 uses it instead of EKS.

### kubectl

The CLI. Pronounced "cube-control", or "cube-cuddle" if you're feeling brave.

---

## Node.js and tooling

### npm ci vs npm install

- `npm install` may *update* the lockfile
- `npm ci` installs exactly what the lockfile says, failing if it disagrees
  with `package.json`

**Always `npm ci` in CI.** It is reproducible and faster.

### Lockfile

`package-lock.json` pins the exact resolved version of every transitive
dependency.

**Why it matters:** `^9.13.0` could resolve to different versions on different
days. The lockfile makes builds deterministic.

### Multi-stage Docker build

Build in one stage, copy only the artefacts into a smaller final stage.

**Your Dockerfile:** the `deps` stage runs `npm ci --omit=dev`; the `runtime`
stage copies the pruned `node_modules`. ESLint never reaches the final image —
smaller, and a smaller attack surface.

### Dependabot

Opens PRs when dependencies have updates. Your CI then decides whether they are
safe to merge — which is the point: automation proposes, tests dispose.

### ESLint flat config

`eslint.config.js`, the ESLint 9 format replacing `.eslintrc`. Plain JavaScript
exporting an array of config objects.
