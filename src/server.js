const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Todo API running on port ${PORT}`));

// Graceful shutdown: Kubernetes sends SIGTERM during deploys and scale-down.
// Stop accepting new connections and let in-flight requests finish.
function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  // Force exit if connections hang beyond 10 seconds
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));