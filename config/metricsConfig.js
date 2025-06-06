const promClient = require("prom-client")

// Create a Registry to store metrics
const register = new promClient.Registry()

// Add default metrics
promClient.collectDefaultMetrics({
    register,
    prefix: "core_serve_",
})

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
    name: "core_serve_http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 0.5, 1, 2, 5],
})

const totalUsers = new promClient.Gauge({
    name: "core_serve_total_users",
    help: "Total number of registered users",
})

const activeLogins = new promClient.Counter({
    name: "core_serve_login_total",
    help: "Total number of user logins",
})

register.registerMetric(httpRequestDuration)
register.registerMetric(totalUsers)
register.registerMetric(activeLogins)

module.exports = {
    register,
    metrics: {
        httpRequestDuration,
        totalUsers,
        activeLogins,
    },
}
