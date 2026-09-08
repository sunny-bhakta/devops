# Rollback Runbook

**Purpose:** restore service quickly and predictably after a bad release.
**Audience:** whoever is on call — assume they are tired and under pressure.

> Rule: **restore service first, investigate second.** Do not debug a
> production outage in production. Roll back, then diagnose from logs.

---

## 0. Before you touch anything (30 seconds)

- [ ] Note the current UTC time
- [ ] Note the deployed version/SHA
- [ ] Post in the incident channel: *"Investigating elevated errors on `<service>`, will update in 10 min"*

Communication is part of the fix. Silence makes an incident feel longer than it is.

---

## 1. Decide: roll back or roll forward?

| Situation | Action |
|---|---|
| Errors began right after a deploy | **Roll back** |
| Cause unknown, users impacted | **Roll back** |
| Trivial, understood, one-line fix, low traffic | Roll forward |
| Data migration already applied | **Stop.** See §5 |

Default is roll back. Rolling forward under pressure is how a 5-minute
incident becomes a 2-hour one.

---

## 2. Identify the last known-good version

Every image is tagged with its commit SHA (see `push-to-ecr` in `ci.yml`),
so "last known good" is always identifiable.

```bash
aws ecr describe-images \
  --repository-name devops-nodejs-app \
  --region ap-south-1 \
  --query 'sort_by(imageDetails,&imagePushedAt)[-5:].[imageTags[0],imagePushedAt]' \
  --output table
```

Pick the SHA of the previous successful release.

---

## 3. Roll back

### Path A — Lambda (alias shifting)

Fastest option: repoint the alias at the previous version. No rebuild.

```bash
# What is live now?
aws lambda get-alias \
  --function-name devops-nodejs-app \
  --name live \
  --region ap-south-1

# Point back to the previous version
aws lambda update-alias \
  --function-name devops-nodejs-app \
  --name live \
  --function-version <PREVIOUS_VERSION> \
  --region ap-south-1
```

**Recovery time: seconds.**

### Path B — ECS Fargate

```bash
# Roll back to the previous task definition revision
aws ecs update-service \
  --cluster devops-cluster \
  --service devops-nodejs-app \
  --task-definition devops-nodejs-app:<PREVIOUS_REVISION> \
  --region ap-south-1

# Watch it settle
aws ecs wait services-stable \
  --cluster devops-cluster \
  --services devops-nodejs-app \
  --region ap-south-1
```

**Recovery time: 2–5 minutes** (drain + health checks).

### Path C — revert the commit

Use when the artifact itself is fine but the change was wrong.

```bash
git checkout main
git pull
git revert --no-edit <BAD_SHA>
git push
```

Slowest path — waits for the full pipeline. Prefer A or B during an active incident.

---

## 4. Verify recovery

- [ ] `GET /health` returns 200
- [ ] Error rate back to baseline in CloudWatch
- [ ] Latency back to baseline
- [ ] Alarm returned to `OK`
- [ ] Spot-check a real user journey

```bash
curl -fsS https://<your-endpoint>/health
```

Do not declare resolution off a green dashboard alone — confirm with a real request.

---

## 5. Special case: database migrations

If the bad release applied a schema migration, **rolling back code alone can
make things worse** — old code against a new schema.

- [ ] Is the migration backward-compatible? If yes → roll back code normally
- [ ] If no → roll forward with a fix, or restore from snapshot
- [ ] Never run a down-migration on production data without a verified backup

This is why expand/contract migrations matter: deploy schema changes that
tolerate both old and new code, so rollback stays safe.

---

## 6. After service is restored

- [ ] Post the all-clear with timestamps
- [ ] Open an incident issue
- [ ] Write the postmortem within 48h (see `POSTMORTEM_SAMPLE.md`)
- [ ] Add a regression test reproducing the failure
- [ ] Ask: *why did CI not catch this?*

That last question is the valuable one. Every incident is a gap in the pipeline.

---

## Escalation

| Time elapsed | Action |
|---|---|
| 15 min, not recovered | Escalate to a second engineer |
| 30 min, not recovered | Consider maintenance page |
| 60 min, not recovered | Open an AWS support case |

---

## Quick reference

| Task | Command |
|---|---|
| List recent images | `aws ecr describe-images --repository-name devops-nodejs-app --region ap-south-1` |
| Current Lambda alias | `aws lambda get-alias --function-name devops-nodejs-app --name live --region ap-south-1` |
| Roll back Lambda | `aws lambda update-alias --function-name devops-nodejs-app --name live --function-version <N> --region ap-south-1` |
| Roll back ECS | `aws ecs update-service --cluster devops-cluster --service devops-nodejs-app --task-definition <NAME>:<REV> --region ap-south-1` |
| Tail logs | `aws logs tail /aws/lambda/devops-nodejs-app --follow --region ap-south-1` |
| Health check | `curl -fsS https://<endpoint>/health` |
