# Week 3 — Dockerize the app

This is the single source of truth for Week 3 execution details.

## Deliverables

- [x] Create `Dockerfile` for production build.
  - Multi-stage: `deps` (via `npm ci --omit=dev`) → `runtime`
  - Base image `node:20-alpine`, runs as non-root `USER node`
  - Built-in `HEALTHCHECK` hitting `/health`
- [x] Add `.dockerignore` (excludes `node_modules`, `.git`, `docs`, `test`, coverage).
- [x] Run app from a container — **verified in CI, no local Docker needed**.
  - New `docker-build` job in `ci.yml`: builds the image, starts it,
    polls `GET /health` until 200, prints image size, then cleans up.
- [x] Add `compose.yaml` for optional one-command local runs.

## Definition of done

- [x] `docker-build` job is green on a PR.
- [x] Smoke test confirms `/health` returns 200 from inside the container.
- [x] Image contains no dev dependencies (ESLint absent from the runtime stage).

## Optional local commands

```bat
docker compose up --build
curl http://localhost:3000/health
docker compose down
```
