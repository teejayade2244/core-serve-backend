const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const cors = require("cors")
const bodyParser = require("body-parser")
const authRouter = require("./routes/authRoutes")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const { dbConnect } = require("./config/dbConnect")
const { notFound, errorhandler } = require("./middlewares/errorHandler")
const helmet = require("helmet")
const PORT = process.env.PORT || 4000
const http = require("http")
const mongoose = require("mongoose")
// Do not import metricsRoutes here if it's only for metricsApp
// const metricsRoutes = require("./routes/metricsRoutes")
const { register, metrics } = require("./config/metricsConfig") // Ensure 'metrics' is imported here
const metricsMiddleware = require("./middlewares/metricsMiddleware")

// HTTP server using the express app
const server = http.createServer(app)

// Initialize Socket.IO with the HTTP server
const io = require("socket.io")(server, {
    cors: {
        origin: "http://a0bd629c8c1994870836f96ba4cd1321-2074734726.eu-west-2.elb.amazonaws.com:3000/", // Removed trailing slash
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
})

io.on("connection", (socket) => {
    console.log("New client connected")
    // You might want to increment/decrement metrics.activeSessions here
    socket.on("disconnect", () => console.log("Client disconnected"))
})

// UPDATED CORS CONFIGURATION
const corsOptions = {
    origin: [
        "http://a0bd629c8c1994870836f96ba4cd1321-2074734726.eu-west-2.elb.amazonaws.com:3000/",
        "http://localhost:3000", // for local development
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "my-custom-header"],
    credentials: true,
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(morgan("dev"))
app.set("io", io)

// Apply metrics middleware to capture request durations for ALL routes
app.use(metricsMiddleware)

// --- FIXED ROUTING ORDER ---
// Define specific application routes BEFORE general-purpose routers
// (like authRouter) and before the notFound middleware.

// Root path handler
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Core Serve Backend API!" })
})

// Health and Readiness Probes - moved up to be handled
app.get("/healthz", (req, res) => {
    console.log("Health check hit")
    // Ensure metrics.healthCheckStatus is defined and correctly incremented/set
    // If not, remove or handle gracefully to avoid errors.
    if (metrics && metrics.healthCheckStatus) {
        metrics.healthCheckStatus.set(1) // Set metric to 1 (healthy)
    }
    res.status(200).json({ status: "ok" })
})

app.get("/readyz", async (req, res) => {
    console.log("Readiness check hit")
    try {
        await mongoose.connection.db.admin().ping()
        console.log("Database ping successful")
        if (metrics && metrics.healthCheckStatus) {
            metrics.healthCheckStatus.set(1) // Set metric to 1 (ready)
        }
        res.status(200).json({ status: "ready" })
    } catch (error) {
        console.log("Database ping failed:", error.message)
        if (metrics && metrics.healthCheckStatus) {
            metrics.healthCheckStatus.set(0) // Set metric to 0 (not ready)
        }
        res.status(503).json({ status: "not ready", error: error.message })
    }
})

// Now add body parsers and other security middleware after basic routes,
// but before specific API routers.
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(cookieParser())

// Main API Router
app.use("/api/user", authRouter)

// --- END FIXED ROUTING ORDER ---

// Create a separate Express app for metrics
const metricsApp = express()
const METRICS_PORT = process.env.METRICS_PORT || 7000

// Apply metrics middleware to metrics app (if desired for metrics server itself)
metricsApp.use(metricsMiddleware)

// The actual /metrics endpoint for Prometheus to scrape
metricsApp.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", register.contentType)
        res.end(await register.metrics())
    } catch (err) {
        res.status(500).end(err)
    }
})

// Start metrics server on different port
if (process.env.NODE_ENV !== "test") {
    metricsApp.listen(METRICS_PORT, () => {
        console.log(`Metrics server is running on port ${METRICS_PORT}`)
    })
}

if (process.env.NODE_ENV !== "test") {
    dbConnect()
}

// These must be at the end of all routes and middleware
app.use(notFound)
app.use(errorhandler)

// Only start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
    })
}

module.exports = { app, server, io }
