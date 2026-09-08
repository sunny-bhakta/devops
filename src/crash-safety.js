'use strict';

// On fatal process-level errors, log and trigger graceful shutdown.
function setupCrashSafety(shutdown, { processRef = process, logger = console } = {}) {
  const handleFatal = (event, errorLike) => {
    const error = errorLike instanceof Error ? errorLike : new Error(String(errorLike));

    logger.error(
      JSON.stringify({
        level: 'error',
        msg: 'fatal_process_error',
        event,
        error: error.message,
      })
    );

    shutdown();
  };

  // Promise rejected without a catch handler.
  processRef.on('unhandledRejection', (reason) => {
    handleFatal('unhandledRejection', reason);
  });

  // Exception escaped the call stack.
  processRef.on('uncaughtException', (err) => {
    handleFatal('uncaughtException', err);
  });
}

module.exports = { setupCrashSafety };
