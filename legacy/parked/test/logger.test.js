// PARKED — archived from test/logger.test.js for reference.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { createLogger } = require('../src/logger');

function captureStream() {
  const lines = [];
  return {
    lines,
    write(chunk) {
      lines.push(JSON.parse(chunk));
    },
  };
}

test('logger emits one JSON object per line', () => {
  const stream = captureStream();
  const logger = createLogger({ stream });

  logger.info('hello', { userId: 42 });

  assert.equal(stream.lines.length, 1);
  const entry = stream.lines[0];
  assert.equal(entry.level, 'info');
  assert.equal(entry.message, 'hello');
  assert.equal(entry.userId, 42);
  assert.ok(entry.timestamp);
});

test('logger respects the configured level threshold', () => {
  const stream = captureStream();
  const logger = createLogger({ level: 'warn', stream });

  logger.debug('suppressed');
  logger.info('suppressed');
  logger.warn('kept');
  logger.error('kept');

  assert.equal(stream.lines.length, 2);
  assert.deepEqual(
    stream.lines.map((l) => l.level),
    ['warn', 'error']
  );
});

test('logger serialises Error objects including stack', () => {
  const stream = captureStream();
  const logger = createLogger({ stream });

  logger.error('boom', { err: new Error('kaboom') });

  const { err } = stream.lines[0];
  assert.equal(err.name, 'Error');
  assert.equal(err.message, 'kaboom');
  assert.ok(err.stack.includes('kaboom'));
});

test('child logger inherits and merges base context', () => {
  const stream = captureStream();
  const logger = createLogger({ stream, base: { service: 'api' } });

  logger.child({ requestId: 'abc' }).info('handled');

  const entry = stream.lines[0];
  assert.equal(entry.service, 'api');
  assert.equal(entry.requestId, 'abc');
});
