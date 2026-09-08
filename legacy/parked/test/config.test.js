// PARKED — archived from test/config.test.js for reference.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { loadConfig } = require('../src/config');

test('loadConfig applies defaults when env is empty', () => {
  const config = loadConfig({});

  assert.equal(config.port, 3000);
  assert.equal(config.nodeEnv, 'development');
  assert.equal(config.logLevel, 'info');
  assert.equal(config.version, 'dev');
  assert.equal(config.shutdownTimeoutMs, 10000);
  assert.equal(config.isProduction, false);
});

test('loadConfig reads values from env', () => {
  const config = loadConfig({
    PORT: '8080',
    NODE_ENV: 'production',
    LOG_LEVEL: 'warn',
    APP_VERSION: 'a1b2c3d',
    SHUTDOWN_TIMEOUT_MS: '5000',
  });

  assert.equal(config.port, 8080);
  assert.equal(config.nodeEnv, 'production');
  assert.equal(config.logLevel, 'warn');
  assert.equal(config.version, 'a1b2c3d');
  assert.equal(config.shutdownTimeoutMs, 5000);
  assert.equal(config.isProduction, true);
});

test('loadConfig rejects a non-numeric PORT', () => {
  assert.throws(() => loadConfig({ PORT: 'not-a-port' }), /Invalid PORT/);
});

test('loadConfig rejects an out-of-range PORT', () => {
  assert.throws(() => loadConfig({ PORT: '99999' }), /out of range/);
});

test('config object is immutable', () => {
  const config = loadConfig({});
  assert.throws(() => {
    'use strict';
    config.port = 9999;
  }, TypeError);
});
