'use strict';

// Validate PORT early so startup fails fast on bad config.
function parsePort(value) {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`);
  }

  return port;
}

// Return immutable runtime config to avoid accidental mutation later.
function loadConfig(env = process.env) {
  const rawPort = env.PORT ?? '3000';

  return Object.freeze({
    port: parsePort(rawPort),
  });
}

module.exports = { loadConfig, parsePort };
