# Cost Control Guide (Free-plan first)

This is the single source of truth for **cost guardrails and spend policy**.
For Week 4 execution steps (OIDC role, ECR repo, GitHub variables), use
[`WEEK4_AWS_SETUP.md`](./WEEK4_AWS_SETUP.md).
For full cleanup steps, use [`TEARDOWN_RUNBOOK.md`](./TEARDOWN_RUNBOOK.md).

## Account snapshot

| Field | Value |
|---|---|
| Account plan | `Free` |
| Credit amount | `120` |
| Credit expiry date | `2027-09-08` |
| Reminder set for expiry − 2 weeks | `[x]` |

## Project identity (for tagging and IAM scope)

| Field | Value |
|---|---|
| AWS account id | `831975835566` |
| GitHub owner/org | `sunny-bhakta` |
| Repository | `devops` |
| Primary region | `ap-south-1` |

> AWS free-tier terms changed in 2025. New accounts usually get sign-up
> credits with a limited validity period. Always verify terms shown in your AWS
> billing console for your account.

## Why this policy exists

The biggest risk is not "high usage" — it is **forgotten always-on resources**
(ALB, ECS services, NAT gateways). This guide is designed to make accidental
spend unlikely.

## Non-negotiable guardrails

1. **Never create a NAT Gateway** for this learning plan.
2. **Set budgets before creating resources**.
3. **Tag every resource** with:
   - `project=devops-learning`
   - `env=dev`
4. **Destroy non-essential infrastructure after each session**.
5. **Keep ECR lifecycle policy enabled** (retain only latest 2 images).

## Setup checklist (do this first)

- [x] Create a zero-spend budget alert
- [x] Create a $5/month budget with 50/80/100 alerts
- [x] Enable Cost Explorer
- [x] Record credits + expiry date
- [x] Set calendar reminder for expiry − 2 weeks
- [ ] Confirm tagging is consistently applied

## Budget setup reference

1. Billing → Budgets → Create budget
2. Create **Zero spend budget** (email on charge > $0.01)
3. Create a second budget at **$5/month** with 50% / 80% / 100% alerts
4. Billing → Cost Explorer → Enable

> Cost Explorer can take up to 24 hours before full data appears.

## What is safe to use in this plan

| Resource | Approx monthly impact | Policy |
|---|---|---|
| ECR storage (with 2-image lifecycle) | ~$0.02 | Allowed |
| IAM/OIDC | $0 | Allowed |
| ECR scan on push (basic) | $0 | Allowed |
| ECS + ALB (temporary learning sessions) | Variable | Allowed only when actively testing |

## What to avoid

| Resource | Typical cost if forgotten | Policy |
|---|---|---|
| NAT Gateway | ~$32/mo + data | Never create |
| RDS instances | ~$13+/mo | Not needed in this roadmap |
| Unattached Elastic IP | ~$3.6/mo | Remove immediately |
| Excess ECR images | Storage drift | Prevent with lifecycle policy |

## Session shutdown checklist

- [ ] Destroy temporary infrastructure (`cdk destroy --all` or `terraform destroy -auto-approve`)
- [ ] No running ECS services/tasks
- [ ] No ALBs left running
- [ ] No NAT Gateways
- [ ] No unattached Elastic IPs
- [ ] ECR contains ≤ 2 images
- [ ] Check Cost Explorer for today's spend
- [ ] Check remaining credits in Billing

## Two weeks before credit expiry

- [ ] Destroy all non-essential AWS resources
- [ ] Confirm ECS services, ALBs, and ENIs are removed
- [ ] Keep only minimal ECR images (or empty repo)
- [ ] Capture final evidence screenshots in `docs/images/`
- [ ] Decide whether to remain paused or continue on paid usage

## If you later move to paid usage

If you upgrade from the Free plan, keep exactly the same guardrails and add
one stricter rule: **no always-on staging stack unless it is actively used**.
Use time-boxed sessions and teardown discipline to stay within budget.

## Cost target

- Short-term target (current setup): **near $0 out-of-pocket** while credits exist
- Long-term target (paid usage): **$0–5/month** during learning weeks
