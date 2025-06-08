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
        name: "core_serve_registration_total", // Corrected name to match desired alert
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

    // Database connection pool metrics
    dbActiveConnections: new promClient.Gauge({
        name: "core_serve_db_connections_active",
        help: "Number of currently active database connections",
        registers: [register],
    }),
    dbMaxConnections: new promClient.Gauge({
        name: "core_serve_db_connections_max",
        help: "Maximum allowed database connections",
        registers: [register],
    }),

    // Database query duration
    dbQueryDuration: new promClient.Histogram({
        name: "core_serve_db_query_duration_seconds",
        help: "Duration of database queries in seconds",
        labelNames: ["query_type", "status"],
        registers: [register],
    }),

    // Application Health Check Status (1 = healthy, 0 = unhealthy)
    healthCheckStatus: new promClient.Gauge({
        name: "core_serve_health_check_status",
        help: "Application health check status (1 = healthy, 0 = unhealthy)",
        registers: [register],
    }),

    passwordUpdates: new promClient.Counter({
        name: "core_serve_password_updates_total",
        help: "Total number of password update operations",
        registers: [register],
    })
}

// Enable default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register })

module.exports = { metrics, register }
