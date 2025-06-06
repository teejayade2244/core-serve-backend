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

module.exports = metricsMiddleware
