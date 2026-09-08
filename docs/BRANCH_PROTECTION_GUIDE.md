# Branch Protection Setup Guide (Week 1)

Goal: make `main` mergeable only when CI passes.

## 0. Know your check name

From `.github/workflows/ci.yml`:

```yaml
name: CI                    # workflow name
jobs:
  build-and-test:
    name: build-and-test    # <-- this is the status check name
```

The required status check is **`build-and-test`**.

Because the job has an explicit `name:`, GitHub always displays the same string —
in the PR checks box, in the Actions tab, and in the branch-protection dropdown.

> If you previously had `app-ci.yml`, delete it so only one workflow (and one check) exists:
>
> ```bat
> del ".github\workflows\app-ci.yml"
> ```



## 1. Make the check appear first

GitHub only lists checks it has seen at least once.

- [ ] Create a branch and push a small change
- [ ] Open a Pull Request into `main`
- [ ] Wait for the `build-and-test` check to run (pass or fail is fine)

```bat
git checkout -b chore/ci-verify
git commit --allow-empty -m "chore: trigger ci"
git push -u origin chore/ci-verify
```

Then open the PR on GitHub.

## 1b. Where to actually see the check

| Where | How |
|---|---|
| **PR page** | Repo → **Pull requests** → open your PR → scroll to the bottom checks box → click **Details** |
| **Actions tab** | Repo → **Actions** → left sidebar workflow **`CI`** → click the latest run → job `build-and-test` |
| **Commit list** | The 🟡 / ✅ / ❌ icon next to a commit — click it |

If the **Actions** tab is empty:

- The workflow file must be committed and pushed on the branch you're testing.
- Check **Settings → Actions → General → Allow all actions and reusable workflows**.
- The file must live at `.github/workflows/ci.yml` **at the repository root** — if your git repo root is a parent folder, move it there.

## 2. Open branch protection settings

- [ ] GitHub repo page
- [ ] Top menu: **Settings**
- [ ] Left sidebar: **Branches**
- [ ] Section: **Branch protection rules** → **Add branch protection rule** (or **Edit** existing)

> New UI note: some repos show **Settings → Rules → Rulesets**. Either works; Rulesets is the newer equivalent.

### If you use Rulesets (newer UI)

- [ ] **Settings** → **Rules** → **Rulesets** → **New branch ruleset**
- [ ] **Enforcement status**: `Active` (not `Disabled` or `Evaluate`)
- [ ] **Target branches** → **Add target** → **Include default branch**
      (or *Include by pattern* → `main`)
- [ ] Enable **Require a pull request before merging**
- [ ] Enable **Require status checks to pass** → add `build-and-test`
- [ ] Enable **Block force pushes**
- [ ] **Create**

> ⚠️ *"This ruleset does not target any resources and will not be applied."*
> means no target branch was added. Add **Include default branch** and the warning clears.
> Also make sure you are **not** in the ruleset's **Bypass list** while testing.


## 3. Configure the rule

- [ ] **Branch name pattern**: `main`
- [ ] Check **Require a pull request before merging**
- [ ] Check **Require status checks to pass before merging**
- [ ] Check **Require branches to be up to date before merging** (recommended)
- [ ] In the search box under status checks, type `build-and-test`
- [ ] Select **`build-and-test`** from the dropdown
- [ ] Click **Create** / **Save changes**

## 4. Prove it works (Definition of Done)

Failure path:

- [ ] In your PR branch, break a test on purpose
- [ ] Push it
- [ ] Confirm `build-and-test` fails and the **Merge** button is blocked

Success path:

- [ ] Revert the break
- [ ] Push again
- [ ] Confirm `build-and-test` is green and merge is allowed

```bat
git commit -am "test: intentionally break to verify CI gate"
git push
```

```bat
git revert --no-edit HEAD
git push
```

## 5. Capture evidence

Save screenshots into `docs/images/`:

- `week1-branch-protection.png`
- `week1-ci-failed.png`
- `week1-ci-passed.png`

They render automatically in `docs/README.md`.

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `build-and-test` not in dropdown | Workflow never ran | Push a commit / open a PR first |
| Actions tab is empty | Workflow file not at repo root, or Actions disabled | Ensure `.github/workflows/ci.yml` is at the **git repo root**; enable Actions in Settings |
| Two checks appear (`ci` and `build-and-test`) | Old `app-ci.yml` still present | `del ".github\workflows\app-ci.yml"` |
| Check name looks different | Job `name:` changed | Match `jobs.<id>.name` in the workflow file |
| Merge allowed despite red check | Rule not saved or wrong branch pattern | Re-open rule, confirm pattern is `main` |
| Old required check stays "Expected" forever | Branch protection still requires a deleted check | Remove the stale check from the rule |

## Official references (with UI screenshots)

- About protected branches: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>
- Managing a branch protection rule: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule>
- Rulesets: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets>
