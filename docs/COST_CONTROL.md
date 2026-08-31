# Cost Control Guide (No Free Tier)

This repo's learning plan assumes you are paying **real money** from the first resource.
Goal: complete all 8 weeks for roughly **$0–5/month**.

## Rule zero: nothing runs when you are not learning

Most AWS learning bills come from **idle** resources, not from usage.
Every session ends with a teardown.

```bash
# CDK
cdk destroy --all

# Terraform
terraform destroy -auto-approve
```

---

## The expensive things (avoid these)

| Resource | Approx cost if left running | Verdict |
|---|---|---|
| NAT Gateway | ~$32/mo + data | **Never create one** for learning |
| Application Load Balancer (ALB) | ~$16–18/mo | Avoid; only spin up for 1 short exercise |
| ECS Fargate task 0.25vCPU/0.5GB 24/7 | ~$9/mo | Only run during a session, then scale to 0 |
| RDS instance | ~$13/mo+ | Not needed in this plan |
| Elastic IP (unattached) | ~$3.6/mo | Release immediately |
| CloudWatch custom metrics | $0.30/metric/mo | Use default metrics only |
| ECR storage | $0.10/GB/mo | Keep 1–2 images, delete old tags |

> The single biggest saving: **no NAT Gateway, no always-on ALB.**

---

## Cheapest architecture that still teaches the same skills

Replace the ALB + Fargate stack with a serverless one:

| Concept | Expensive way | Cheap equivalent (same learning) |
|---|---|---|
| Run the app | ECS Fargate + ALB | **Lambda + Function URL** |
| HTTPS/TLS | ACM cert on ALB | Built into Function URL (free) |
| Reverse proxy / routing | ALB listener rules | Function URL / API Gateway HTTP API |
| Health checks | ALB target group | Lambda alias + CloudWatch alarm |
| Blue/green deploy | ECS blue/green | **Lambda alias + weighted traffic shifting** |
| Rollback | ECS task set rollback | Point alias back to previous version |
| Logs/metrics | CloudWatch | CloudWatch (same) |

Lambda's free allowance (1M requests + 400k GB-seconds/month) is an **always-free** tier,
not the 12-month tier — so it applies to you even without a new account.

**Practical result:** Weeks 5–8 can cost near $0 on Lambda, versus ~$25+/mo on ALB+Fargate.

---

## Recommended cheap path per week

| Week | Cheap choice | Est. cost |
|---|---|---|
| 1 | GitHub Actions on a public repo (unlimited minutes) | $0 |
| 2 | Same, plus caching to cut minutes | $0 |
| 3 | Docker Desktop locally only — no cloud push yet | $0 |
| 4 | ECR with **1** repo, lifecycle policy keeps 2 images | ~$0.05/mo |
| 5 | Lambda + Function URL instead of ECS/ALB | ~$0 |
| 6 | SSM **Parameter Store Standard** (free) not Secrets Manager ($0.40/secret/mo) | $0 |
| 7 | Lambda alias weighted shifting + manual approval env | $0 |
| 8 | Default CloudWatch metrics + 1 alarm + SNS email | ~$0.10/mo |

---

## If you still want to do the ECS/ALB exercise

Do it as a **single timeboxed session**, not a persistent environment.

- [ ] Deploy the stack at the start of the session
- [ ] Take screenshots for `docs/images/`
- [ ] `cdk destroy` / `terraform destroy` before you close the laptop
- [ ] Verify in the console that the ALB and ENIs are gone

One 2-hour ALB session costs about **$0.05**. Leaving it up for a month costs about **$17**.

---

## Guardrails to set up first (do this before any AWS resource)

1. **Zero-spend budget alert**
   - AWS Console → Billing → Budgets → Create budget
   - Template: *Zero spend budget*
   - Email yourself on any charge above $0.01

2. **Low-threshold cost budget**
   - Second budget at **$5/month**, alert at 50% / 80% / 100%

3. **Enable Cost Explorer**
   - Billing → Cost Explorer → Enable (free, ~24h to populate)

4. **Tag everything**
   - `project=devops-learning`, `env=dev`
   - Lets you filter Cost Explorer to exactly this project

5. **Billing alerts in the right region**
   - Billing metrics live in `us-east-1` — create the alarm there

---

## GitHub Actions cost

- **Public repo** → Actions minutes are **free and unlimited**. Strongly recommended for this project.
- **Private repo (Free plan)** → 2,000 minutes/month. Your CI run is ~1 minute, so this is plenty.

Keep CI cheap:

- [ ] Use `actions/setup-node` cache (already enabled)
- [ ] Avoid matrix builds unless you need them
- [ ] Use `ubuntu-latest` (Windows runners cost 2x, macOS 10x)
- [ ] Add `concurrency` so a new push cancels the old run

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## Local-first alternatives (zero cloud cost)

You can learn most concepts before touching AWS:

| Concept | Local zero-cost tool |
|---|---|
| Container runtime | Docker Desktop |
| Registry | local registry (`registry:2` container) |
| Orchestration basics | `docker compose` |
| Infra-as-code dry run | `cdk synth` / `terraform plan` (no `apply`) |
| AWS API emulation | LocalStack (free tier of the tool) |
| Metrics/dashboards | Prometheus + Grafana containers |

`cdk synth` and `terraform plan` cost **nothing** and still teach you the IaC model.

---

## End-of-session shutdown checklist

- [ ] `cdk destroy --all` / `terraform destroy`
- [ ] No running ECS services or tasks
- [ ] No ALBs
- [ ] No NAT Gateways
- [ ] No unattached Elastic IPs
- [ ] No EBS volumes in "available" state
- [ ] ECR has ≤ 2 images
- [ ] Check Billing → Cost Explorer for today's spend

---

## Monthly cost target

| Scenario | Expected monthly cost |
|---|---|
| Local-only weeks (1–3) | **$0** |
| Serverless path (weeks 4–8), destroyed nightly | **$0–1** |
| Serverless path left running | **$1–3** |
| ECS + ALB left running 24/7 | **$25–35** ← avoid |
