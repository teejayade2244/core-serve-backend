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

    // Failed login attempts
    failedLogins: new promClient.Counter({
        name: "core_serve_failed_login_total",
        help: "Total number of failed login attempts",
        registers: [register],
    }),

    // API endpoints error rate
    apiErrors: new promClient.Counter({
        name: "core_serve_api_errors_total",
        help: "Total number of API errors",
        labelNames: ["endpoint", "error_type"],
        registers: [register],
    }),

    // User registration metrics
    registrationCount: new promClient.Counter({
        name: "core_serve_registration_total",
        help: "Total number of user registrations",
        registers: [register],
    }),

    // Active sessions
    activeSessions: new promClient.Gauge({
        name: "core_serve_active_sessions",
        help: "Number of currently active user sessions",
        registers: [register],
    }),

    // Memory usage
    memoryUsage: new promClient.Gauge({
        name: "core_serve_memory_usage_bytes",
        help: "Process memory usage in bytes",
        registers: [register],
    }),
}

// Enable default metrics
promClient.collectDefaultMetrics({ register })

module.exports = { metrics, register }
