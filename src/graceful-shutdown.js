'use strict';

function setupGracefulShutdown(server) {
    const timeoutMs = 10000;
    let shuttingDown = false;

    const shutdown = () => {
        if (shuttingDown) return;
        shuttingDown = true;

        const timer = setTimeout(() => {
            console.error(`Graceful shutdown timed out after ${timeoutMs}ms`);
            process.exit(1);
        }, 10000);
        timer.unref?.();

        server.close((err) => {
            clearTimeout(timer);
            if (err) return process.exit(1);
            process.exit(0);
        });

        server.closeIdleConnections?.();
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return { shutdown, isShuttingDown: () => shuttingDown };
}

module.exports = { setupGracefulShutdown };