// PARKED — archived from test/app.test.js for reference.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { loadConfig } = require('../src/config');
const { createLogger } = require('../src/logger');
const { createApp } = require('../src/app');

const config = loadConfig({ APP_VERSION: 'test-sha', SERVICE_NAME: 'test-svc' });
// Discard log output during tests.
const logger = createLogger({ stream: { write() {} } });

/** Boot the app on an ephemeral port and return helpers. */
async function withServer(isShuttingDown = () => false) {
  const app = createApp({ config, logger, isShuttingDown });
  const server = http.createServer(app.handleRequest);

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  return {
    async get(path, headers = {}) {
      const res = await fetch(`http://127.0.0.1:${port}${path}`, { headers });
      const text = await res.text();
      return {
        status: res.status,
        headers: res.headers,
        body: text ? JSON.parse(text) : null,
      };
    },
    async close() {
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

test('GET /health returns 200 with service metadata', async () => {
  const srv = await withServer();
  try {
    const res = await srv.get('/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'test-svc');
    assert.equal(res.body.version, 'test-sha');
    assert.equal(typeof res.body.uptimeSeconds, 'number');
  } finally {
    await srv.close();
  }
});

test('GET / returns the greeting payload', async () => {
  const srv = await withServer();
  try {
    const res = await srv.get('/');

    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Hello from devops/nodejs-app');
    assert.equal(res.body.version, 'test-sha');
    assert.ok(res.body.timestamp);
  } finally {
    await srv.close();
  }
});

test('GET /ready returns 200 when healthy', async () => {
  const srv = await withServer(() => false);
  try {
    const res = await srv.get('/ready');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ready');
  } finally {
    await srv.close();
  }
});

test('GET /ready returns 503 while draining', async () => {
  // This is what stops the load balancer sending traffic during a deploy.
  const srv = await withServer(() => true);
  try {
    const res = await srv.get('/ready');
    assert.equal(res.status, 503);
    assert.equal(res.body.status, 'shutting_down');
  } finally {
    await srv.close();
  }
});

test('unknown route returns 404', async () => {
  const srv = await withServer();
  try {
    const res = await srv.get('/does-not-exist');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Not Found');
  } finally {
    await srv.close();
  }
});

test('query strings do not break routing', async () => {
  const srv = await withServer();
  try {
    const res = await srv.get('/health?verbose=true');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  } finally {
    await srv.close();
  }
});

test('responses include a request id and security headers', async () => {
  const srv = await withServer();
  try {
    const res = await srv.get('/');

    assert.ok(res.headers.get('x-request-id'));
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('content-type'), 'application/json');
  } finally {
    await srv.close();
  }
});

test('an inbound x-request-id is propagated back', async () => {
  const srv = await withServer();
  try {
    const res = await srv.get('/', { 'x-request-id': 'trace-me-123' });
    assert.equal(res.headers.get('x-request-id'), 'trace-me-123');
  } finally {
    await srv.close();
  }
});
