const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5],
  registers: [register],
});

const httpTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Records latency and count per request. Uses the route pattern (e.g. /todos/:id)
// rather than the raw URL to keep label cardinality low.
function metricsMiddleware(req, res, next) {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : 'unmatched';
    const labels = { method: req.method, route, status_code: res.statusCode };
    end(labels);
    httpTotal.inc(labels);
  });
  next();
}

module.exports = { register, metricsMiddleware };