'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { setupGracefulShutdown } = require('../src/graceful-shutdown');

async function withMockedProcess(run) {
  const originalOn = process.on;
  const originalExit = process.exit;

  const processEvents = {};
  let exitCode = null;

  process.on = (event, handler) => {
    processEvents[event] = handler;
    return process;
  };

  process.exit = (code) => {
    exitCode = code;
  };

  try {
    return await run({ processEvents, getExitCode: () => exitCode });
  } finally {
    process.on = originalOn;
    process.exit = originalExit;
  }
}

test('graceful shutdown closes server and exits with 0', async () => {
  await withMockedProcess(async ({ processEvents, getExitCode }) => {
    let closeCalled = 0;
    const server = {
      close(cb) {
        closeCalled += 1;
        setImmediate(() => cb(null));
      },
    };

    const manager = setupGracefulShutdown(server);

    processEvents.SIGTERM();
    assert.equal(manager.isShuttingDown(), true);

    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(closeCalled, 1);
    assert.equal(getExitCode(), 0);
  });
});

test('graceful shutdown exits with 1 when server close fails', async () => {
  await withMockedProcess(async ({ processEvents, getExitCode }) => {
    const server = {
      close(cb) {
        setImmediate(() => cb(new Error('close failed')));
      },
    };

    setupGracefulShutdown(server);

    processEvents.SIGINT();
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(getExitCode(), 1);
  });
});
