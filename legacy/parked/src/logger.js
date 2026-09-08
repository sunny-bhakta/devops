// PARKED — archived from src/logger.js for reference.
'use strict';

/**
 * Minimal structured JSON logger — zero dependencies.
 *
 * CloudWatch Logs Insights, Datadog and friends can query JSON fields
 * directly. Free-text `console.log` forces brittle regex parsing, so every
 * line here is a single JSON object on one line.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function createLogger({ level = 'info', base = {}, stream = process.stdout } = {}) {
  const threshold = LEVELS[level] ?? LEVELS.info;

  function write(levelName, message, fields = {}) {
    if (LEVELS[levelName] < threshold) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      ...base,
      ...fields,
    };

    // Errors do not serialise with JSON.stringify by default.
    if (fields.err instanceof Error) {
      entry.err = {
        name: fields.err.name,
        message: fields.err.message,
        stack: fields.err.stack,
      };
    }

    stream.write(`${JSON.stringify(entry)}\n`);
  }

  return {
    debug: (msg, fields) => write('debug', msg, fields),
    info: (msg, fields) => write('info', msg, fields),
    warn: (msg, fields) => write('warn', msg, fields),
    error: (msg, fields) => write('error', msg, fields),
    /** Derive a logger that always includes extra context, e.g. a request id. */
    child: (extra) =>
      createLogger({ level, base: { ...base, ...extra }, stream }),
  };
}

module.exports = { createLogger, LEVELS };
