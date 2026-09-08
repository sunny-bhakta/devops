'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { setupCrashSafety } = require('../src/crash-safety');

test('setupCrashSafety logs and calls shutdown on unhandledRejection', () => {
  const events = {};
  const processRef = {
    on(event, handler) {
      events[event] = handler;
      return this;
    },
  };

  const logs = [];
  const logger = {
    error(msg) {
      logs.push(msg);
    },
  };

  let shutdownCalled = 0;
  setupCrashSafety(() => {
    shutdownCalled += 1;
  }, { processRef, logger });

  events.unhandledRejection('boom');

  assert.equal(shutdownCalled, 1);
  assert.equal(logs.length, 1);
  assert.match(logs[0], /fatal_process_error/);
  assert.match(logs[0], /unhandledRejection/);
});

test('setupCrashSafety logs and calls shutdown on uncaughtException', () => {
  const events = {};
  const processRef = {
    on(event, handler) {
      events[event] = handler;
      return this;
    },
  };

  const logs = [];
  const logger = {
    error(msg) {
      logs.push(msg);
    },
  };

  let shutdownCalled = 0;
  setupCrashSafety(() => {
    shutdownCalled += 1;
  }, { processRef, logger });

  events.uncaughtException(new Error('oops'));

  assert.equal(shutdownCalled, 1);
  assert.equal(logs.length, 1);
  assert.match(logs[0], /fatal_process_error/);
  assert.match(logs[0], /uncaughtException/);
});
