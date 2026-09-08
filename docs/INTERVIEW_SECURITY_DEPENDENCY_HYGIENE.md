# Security & Dependency Hygiene Interview Cheat Sheet

Use this as a short speaking script for interviews.

## 60-second answer

I automated two things in CI/CD: security scanning and dependency
updates.

1. **Dependency audit, image scan, SBOM, SAST, secret scan**
	- Dependency audit checks Node packages for known CVEs.
	- Image scan checks container layers (OS + libs) for vulnerabilities.
	- SBOM creates a full inventory of shipped components.
	- SAST scans source code for risky patterns before runtime.
	- Secret scan catches leaked keys/tokens in files and git history.

2. **Automated dependency updates**
	- Dependabot opens PRs for npm packages, GitHub Actions, and Docker base images.
	- This keeps patching continuous and reduces manual drift.

**Result:** faster vulnerability detection, safer releases, and lower MTTR.

---

## One-line definitions

- **Dependency audit:** detects vulnerable app dependencies.
- **Image scan:** detects vulnerable OS/app layers in container images.
- **SBOM:** bill of materials listing everything inside a build/image.
- **SAST:** static code scanning for security issues.
- **Secret scan:** detects accidental credential leaks.
- **Dependabot:** bot that creates update PRs automatically.

---

## Common interview follow-ups

### Q: Why both dependency audit and image scan?

Because they cover different layers:
- Dependency audit covers application packages.
- Image scan covers base image and system packages too.

### Q: Why generate SBOM if scans already exist?

SBOM gives traceability and compliance evidence and helps quickly identify
affected components when a new CVE is announced.

### Q: Why automate updates?

Automation reduces patch lag and human error. Security fixes arrive as PRs,
so updates become part of normal review flow.

### Q: What does “done” look like?

- Security workflow runs on PRs/push/schedule.
- Vulnerability thresholds block merges when needed.
- SBOM artifact is generated and stored.
- Secret scan covers full git history.
- Dependabot opens update PRs weekly.

---

## About the YAML files (what to say in interview)

### `.github/workflows/security.yml`

This is the CI security workflow file.

- Runs on `pull_request`, `push` to `main`, and weekly `schedule`.
- Audits Node dependencies with `npm audit` (high/critical gate).
- Builds and scans Docker image with Trivy.
- Generates CycloneDX SBOM and uploads it as an artifact.
- Runs CodeQL (SAST) for JavaScript/TypeScript.
- Runs Gitleaks secret scan on full git history.

**Interview line:**
"`security.yml` is my automated security gate. It blocks risky changes before merge and keeps scanning weekly for newly disclosed CVEs."

### `.github/dependabot.yml`

This is the dependency update automation file.

- Creates weekly update PRs for:
	- npm packages
	- GitHub Actions
	- Docker dependencies
- Groups development dependency updates to reduce PR noise.
- Uses consistent commit prefixes for clean history.

**Interview line:**
"`dependabot.yml` keeps dependencies continuously patched, so updates flow through normal PR review instead of ad-hoc manual upgrades."

---

## 15-second version (if interviewer is rushing)

I set up CI security gates: package audit, container scan, SBOM generation,
SAST, and secret scanning; plus Dependabot for automated patch PRs. That gives
continuous security checks and keeps dependencies current with minimal manual
work.
