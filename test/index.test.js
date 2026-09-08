'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';

const { app, server } = require('../src/index');

test.afterEach(() => {
  app.locals.isShuttingDown = () => false;
});

test('GET / returns a greeting', async () => {
  const res = await request(app).get('/');

  assert.equal(res.statusCode, 200);
  assert.match(res.headers['content-type'], /application\/json/);
  assert.equal(res.body.message, 'Hello from the DevOps learning app');
});

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.version);
});

test('GET /ready returns 200 when not draining', async () => {
  const res = await request(app).get('/ready');

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'ready');
});

test('GET /ready returns 503 while draining', async () => {
  app.locals.isShuttingDown = () => true;

  const res = await request(app).get('/ready');

  assert.equal(res.statusCode, 503);
  assert.equal(res.body.status, 'shutting_down');
});

test('propagates incoming x-request-id header', async () => {
  const res = await request(app).get('/health').set('x-request-id', 'abc-123');

  assert.equal(res.headers['x-request-id'], 'abc-123');
});

test('generates request id when header is missing', async () => {
  const res = await request(app).get('/health');

  assert.ok(res.headers['x-request-id']);
});

test('error containment returns generic 500 without stack trace', async () => {
  const res = await request(app).get('/__test/error');

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, 'Internal Server Error');
  assert.ok(res.body.requestId);
  assert.equal(res.body.stack, undefined);
});

test('keep-alive timeouts are tuned', () => {
  assert.equal(server.keepAliveTimeout, 65000);
  assert.equal(server.headersTimeout, 66000);
});

test('unknown route returns 404', async () => {
  const res = await request(app).get('/nope');

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error, 'Not Found');
});
