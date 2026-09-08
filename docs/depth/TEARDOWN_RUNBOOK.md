# Teardown Runbook (AWS cleanup)

Use this runbook whenever you pause work, finish a session, or need to stop
cost quickly.

Region for project resources: **`ap-south-1`**
Exception: billing/alerts may live in **`us-east-1`**.

---

## Scope

This runbook covers cleanup for:

- ECR repository `devops-nodejs-app`
- IAM role `github-actions-ecr-push`
- OIDC provider `token.actions.githubusercontent.com`
- Week 5 infra (ECS/ALB/etc.) if created

---

## Safe order (recommended)

1. **Stop compute first** (ECS/Lambda/anything running)
2. **Delete load balancers/network-heavy resources**
3. **Delete container artifacts** (ECR images/repo)
4. **Delete IAM role and OIDC provider**
5. **Verify no chargeable resources remain**

This order prevents dependency errors and reduces spend fastest.

---

## Step-by-step teardown

### 1) Confirm region

- Set console region selector to **`ap-south-1`**

### 2) Delete ECR repository

- ECR → Repositories → `devops-nodejs-app`
- **Delete** → confirm deletion of images and repository

CLI fallback:

```bat
aws ecr delete-repository --region ap-south-1 --repository-name devops-nodejs-app --force
```

### 3) Delete IAM role

- IAM → Roles → `github-actions-ecr-push`
- Remove inline policy `ecr-push` if prompted
- **Delete role**

CLI fallback:

```bat
aws iam delete-role-policy --role-name github-actions-ecr-push --policy-name ecr-push
aws iam delete-role --role-name github-actions-ecr-push
```

### 4) Delete OIDC provider

- IAM → Identity providers
- Select `token.actions.githubusercontent.com`
- **Delete provider**[]

CLI fallback:

```bat
aws iam delete-open-id-connect-provider --open-id-connect-provider-arn arn:aws:iam::831975835566:oidc-provider/token.actions.githubusercontent.com
```

### 5) If Week 5 infra exists

- Delete ECS services/tasks
- Delete ALB + target groups
- Delete any leftover ENIs/EIPs/NAT gateways (NAT should never exist in this plan)
- Run IaC destroy command if stack was created

---

## Verification checklist (must pass)

- [ ] No ECS services/tasks running
- [ ] No ALBs in `ap-south-1`
- [ ] ECR repo `devops-nodejs-app` does not exist
- [ ] IAM role `github-actions-ecr-push` does not exist
- [ ] OIDC provider `token.actions.githubusercontent.com` removed
- [ ] Cost Explorer checked for today’s spend

> Keep budgets in place; budgets are free and should stay enabled.

---

## Quick emergency cleanup commands

```bat
aws ecr delete-repository --region ap-south-1 --repository-name devops-nodejs-app --force
aws iam delete-role-policy --role-name github-actions-ecr-push --policy-name ecr-push
aws iam delete-role --role-name github-actions-ecr-push
aws iam delete-open-id-connect-provider --open-id-connect-provider-arn arn:aws:iam::831975835566:oidc-provider/token.actions.githubusercontent.com
```
