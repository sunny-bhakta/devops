# Standalone Node.js App (inside `devops`)

This is a separate, minimal Node.js app for CI/CD and AWS deployment practice.

## Features

- Basic HTTP server
- `GET /health` endpoint for health checks
- Simple test suite using built-in Node test runner

## Project structure

- `src/index.js` - app server
- `test/index.test.js` - tests
- `package.json` - scripts and metadata

## Run locally

```bat
npm install
npm start
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/health`

## Run tests

```bat
npm test
```

## Why this helps your DevOps plan

- Easy to containerize in Week 3
- Health endpoint fits ALB/ECS checks in Week 5
- Small blast radius for CI/CD experiments
