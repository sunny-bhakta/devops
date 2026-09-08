// PARKED — archived from src/server.js for reference.
'use strict';

const http = require('node:http');

/**
 * Server lifecycle: startup, graceful shutdown, crash safety.
 *
 * Why graceful shutdown matters:
 * during a deploy the orchestrator sends SIGTERM and then SIGKILLs after a
 * grace period. Exiting immediately drops in-flight requests, which users see
 * as 502s on every deploy. Draining first turns that into zero-downtime.
 */

function createServer({ config, logger, app }) {
  const server = http.createServer(app.handleRequest);

  // Slightly above a typical ALB idle timeout (60s) to avoid the race where
  // the balancer reuses a socket the server is simultaneously closing.
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  return server;
}

function start({ config, logger, createAppFn, createServerFn }) {
  let shuttingDown = false;

  const app = createAppFn({
    config,
    logger,
    isShuttingDown: () => shuttingDown,
  });

  const server = createServerFn({ config, logger, app });

  server.listen(config.port, () => {
    logger.info('server started', {
      port: config.port,
      nodeEnv: config.nodeEnv,
      version: config.version,
      pid: process.pid,
    });
  });

  async function shutdown(signal) {
    if (shuttingDown) {
      logger.warn('shutdown already in progress', { signal });
      return;
    }
    shuttingDown = true;

    logger.info('shutdown initiated', { signal });

    // Force exit if draining hangs, so we exit on our terms rather than
    // being SIGKILLed mid-request.
    const forceTimer = setTimeout(() => {
      logger.error('graceful shutdown timed out, forcing exit', {
        timeoutMs: config.shutdownTimeoutMs,
      });
      process.exit(1);
    }, config.shutdownTimeoutMs);
    forceTimer.unref();

    // Stop accepting new connections; existing ones finish.
    server.close((err) => {
      clearTimeout(forceTimer);
      if (err) {
        logger.error('error during server close', { err });
        process.exit(1);
      }
      logger.info('shutdown complete');
      process.exit(0);
    });

    // Node 18.2+: close idle keep-alive sockets so close() is not blocked.
    if (typeof server.closeIdleConnections === 'function') {
      server.closeIdleConnections();
    }
  }

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => shutdown(signal));
  }

  // A process with an unhandled rejection or uncaught exception is in an
  // undefined state. Log it, then exit so the orchestrator restarts cleanly.
  process.on('unhandledRejection', (reason) => {
    logger.error('unhandled promise rejection', {
      err: reason instanceof Error ? reason : new Error(String(reason)),
    });
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.error('uncaught exception', { err });
    shutdown('uncaughtException');
  });

  return { server, shutdown, isShuttingDown: () => shuttingDown };
}

module.exports = { createServer, start };
