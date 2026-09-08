'use strict';

const http = require('node:http');
const crypto = require('node:crypto');
const express = require('express');
const { setupGracefulShutdown } = require('./graceful-shutdown');
const { loadConfig } = require('./runtime-config');
const { setupCrashSafety } = require('./crash-safety');

// Validated + frozen config (throws early if PORT is invalid).
const config = loadConfig();
const APP_VERSION = process.env.APP_VERSION || 'dev';

const app = express();
app.locals.isShuttingDown = () => false;

// Request ID + structured JSON access log (zero dependencies).
app.use((req, res, next) => {
  const requestId = req.get('x-request-id') || crypto.randomUUID();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const logLine = {
      level: 'info',
      msg: 'request_completed',
      version: APP_VERSION,
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    };

    console.log(JSON.stringify(logLine));
  });

  next();
});

// Liveness probe: only checks if process is up.
// Keep this cheap and always 200 while process is alive.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', version: APP_VERSION });
});

// Readiness probe: controls if this instance should receive traffic.
// While draining during shutdown, return 503 so LB stops routing here first.
app.get('/ready', (_req, res) => {
  if (app.locals.isShuttingDown()) {
    res.status(503).json({ status: 'shutting_down' });
    return;
  }

  res.status(200).json({ status: 'ready' });
});

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Hello from the DevOps learning app' });
});

// Test-only trigger to validate error containment behavior.
if (process.env.NODE_ENV === 'test') {
  app.get('/__test/error', () => {
    throw new Error('test error');
  });
}

// Error containment: never leak stack traces to clients.
function handleAppError(err, req, res, _next) {
  console.error(
    JSON.stringify({
      level: 'error',
      msg: 'request_failed',
      version: APP_VERSION,
      requestId: req.requestId,
      error: err?.message || 'unknown_error',
    })
  );

  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.requestId,
  });
}

app.use(handleAppError);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const server = http.createServer(app);
// Keep-alive tuning: slightly above common ALB idle timeout (60s).
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

if (require.main === module) {
  server.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });

  const shutdownManager = setupGracefulShutdown(server);
  app.locals.isShuttingDown = shutdownManager.isShuttingDown;
  // Crash safety: fatal process errors are logged and drained before exit.
  setupCrashSafety(shutdownManager.shutdown);
}

module.exports = {
  app,
  server,
  setupGracefulShutdown,
  loadConfig,
  setupCrashSafety,
  handleAppError,
};
