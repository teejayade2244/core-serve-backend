const { metrics } = require("../config/metricsConfig")

const metricsMiddleware = (req, res, next) => {
    const start = Date.now()

    res.on("finish", () => {
        const duration = Date.now() - start
        metrics.httpRequestDuration.observe(
            {
                method: req.method,
                route: req.route?.path || req.path,
                status_code: res.statusCode,
            },
            duration / 1000
        )
    })

    next()
}

// Helper functions for updating metrics
metricsMiddleware.incrementTotalUsers = () => {
    metrics.totalUsers.inc()
}

metricsMiddleware.incrementLoginCount = () => {
    metrics.activeLogins.inc()
}

metricsMiddleware.resetMetrics = async () => {
    await metrics.activeLogins.reset()
    await metrics.totalUsers.reset()
    await metrics.httpRequestDuration.reset()
}

module.exports = metricsMiddleware
