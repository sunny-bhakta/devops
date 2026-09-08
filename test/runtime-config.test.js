'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { loadConfig } = require('../src/runtime-config');

test('loadConfig returns frozen validated config', () => {
  const cfg = loadConfig({ PORT: '3001' });

  assert.equal(cfg.port, 3001);
  assert.equal(Object.isFrozen(cfg), true);
});

test('loadConfig throws on bad PORT', () => {
  assert.throws(() => loadConfig({ PORT: 'abc' }), /Invalid PORT/);
  assert.throws(() => loadConfig({ PORT: '70000' }), /Invalid PORT/);
});
