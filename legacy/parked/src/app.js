// PARKED — archived from src/app.js for reference.
'use strict';

const crypto = require('node:crypto');

/**
 * HTTP application: routing, observability endpoints, error handling.
 *
 * Deliberately separated from server lifecycle (see `server.js`) so the
 * request logic is testable without binding a port.
 */

function json(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    // Baseline hardening headers.
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(body);
}

/**
 * @param {object}   deps
 * @param {object}   deps.config
 * @param {object}   deps.logger
 * @param {Function} deps.isShuttingDown - readiness gate during drain
 */
function createApp({ config, logger, isShuttingDown = () => false }) {
  const startedAt = Date.now();

  function handleRequest(req, res) {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    const start = process.hrtime.bigint();
    const log = logger.child({ requestId });

    res.setHeader('X-Request-Id', requestId);

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      log.info('request completed', {
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      });
    });

    try {
      route(req, res, log);
    } catch (err) {
      log.error('unhandled error in request handler', { err });
      if (!res.headersSent) {
        // Never leak stack traces to clients.
        json(res, 500, { error: 'Internal Server Error', requestId });
      } else {
        res.destroy();
      }
    }
  }

  function route(req, res, log) {
    const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Liveness: is the process up? Must stay cheap and dependency-free.
    if (pathname === '/health') {
      return json(res, 200, {
        status: 'ok',
        service: config.serviceName,
        version: config.version,
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      });
    }

    // Readiness: should this instance receive traffic?
    // Returns 503 while draining so the load balancer stops sending work
    // BEFORE the process exits — this is what makes zero-downtime deploys work.
    if (pathname === '/ready') {
      if (isShuttingDown()) {
        return json(res, 503, { status: 'shutting_down' });
      }
      return json(res, 200, { status: 'ready' });
    }

    if (pathname === '/') {
      return json(res, 200, {
        message: 'Hello from devops/nodejs-app',
        service: config.serviceName,
        version: config.version,
        timestamp: new Date().toISOString(),
      });
    }

    log.warn('route not found', { path: pathname });
    return json(res, 404, { error: 'Not Found', path: pathname });
  }

  return { handleRequest };
}

module.exports = { createApp };
