const test = require('node:test');
const assert = require('node:assert/strict');
const { requestHandler } = require('../src/index');

function createMockRes() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    writeHead(code, headers) {
      this.statusCode = code;
      this.headers = headers;
    },
    end(chunk) {
      this.body = chunk;
    },
  };
}

test('GET /health returns 200 and ok status', () => {
  const req = { url: '/health' };
  const res = createMockRes();

  requestHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(res.body), { status: 'ok' });
});

test('GET / returns greeting payload', () => {
  const req = { url: '/' };
  const res = createMockRes();

  requestHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Content-Type'], 'application/json');

  const parsed = JSON.parse(res.body);
  assert.equal(parsed.message, 'Hello from devops/nodejs-app');
  assert.ok(parsed.timestamp);
});
