const express = require("express")
const router = express.Router()
const { register } = require("../config/metricsConfig")

router.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType)
    try {
        const metrics = await register.metrics()
        res.end(metrics)
    } catch (err) {
        res.status(500).end(err)
    }
})

module.exports = router
