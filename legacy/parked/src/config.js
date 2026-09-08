// PARKED — archived from src/config.js for reference.
'use strict';

/**
 * Centralised, validated configuration.
 *
 * Config is read once at startup and frozen. Reading `process.env` deep inside
 * request handling makes behaviour hard to test and lets a typo silently
 * change behaviour at runtime.
 */

function parseIntOr(value, fallback, name) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${name}: "${value}" is not an integer`);
  }
  return parsed;
}

function loadConfig(env = process.env) {
  const port = parseIntOr(env.PORT, 3000, 'PORT');
  if (port < 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${port} is out of range`);
  }

  const config = {
    port,
    nodeEnv: env.NODE_ENV || 'development',
    logLevel: env.LOG_LEVEL || 'info',
    serviceName: env.SERVICE_NAME || 'devops-nodejs-app',
    // Release identifier. CI injects the commit SHA so every log line and
    // health response can be traced back to exact source.
    version: env.APP_VERSION || 'dev',
    // How long to let in-flight requests finish during shutdown.
    shutdownTimeoutMs: parseIntOr(env.SHUTDOWN_TIMEOUT_MS, 10000, 'SHUTDOWN_TIMEOUT_MS'),
  };

  config.isProduction = config.nodeEnv === 'production';

  return Object.freeze(config);
}

module.exports = { loadConfig };
