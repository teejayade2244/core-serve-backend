const promClient = require("prom-client")

// Create a Registry
const register = new promClient.Registry()

// Initialize metrics
const metrics = {
    httpRequestDuration: new promClient.Histogram({
        name: "core_serve_http_request_duration_seconds",
        help: "Duration of HTTP requests in seconds",
        labelNames: ["method", "route", "status_code"],
        registers: [register],
    }),

    totalUsers: new promClient.Gauge({
        name: "core_serve_total_users",
        help: "Total number of registered users",
        registers: [register],
    }),

    activeLogins: new promClient.Counter({
        name: "core_serve_login_total",
        help: "Total number of successful logins",
        registers: [register],
    }),
}

// Enable default metrics
promClient.collectDefaultMetrics({ register })

module.exports = { metrics, register }
