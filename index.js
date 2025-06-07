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
const { register } = require("./config/metricsConfig")
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
app.use(metricsMiddleware)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(cookieParser())
app.use("/api/user", authRouter)

// Health and Readiness Probes
app.get("/healthz", (req, res) => {
    console.log("Health check hit")
    res.status(200).json({ status: "ok" })
})

app.get("/readyz", async (req, res) => {
    console.log("Readiness check hit")
    try {
        await mongoose.connection.db.admin().ping()
        console.log("Database ping successful")
        res.status(200).json({ status: "ready" })
    } catch (error) {
        console.log("Database ping failed:", error.message)
        res.status(503).json({ status: "not ready", error: error.message })
    }
})

// Create a separate Express app for metrics
const metricsApp = express()
const METRICS_PORT = process.env.METRICS_PORT || 7000

// Apply metrics middleware to metrics app
metricsApp.use(metricsMiddleware)

// Move metrics endpoint to metrics app
metricsApp.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", register.contentType)
        res.end(await register.metrics())
    } catch (err) {
        res.status(500).end(err)
    }
})

// In test environment, mount metrics app as middleware
if (process.env.NODE_ENV === "test") {
    app.use(metricsApp)
} else {
    // Start metrics server on different port in non-test environment
    metricsApp.listen(METRICS_PORT, () => {
        console.log(`Metrics server is running on port ${METRICS_PORT}`)
    })
}

if (process.env.NODE_ENV !== "test") {
    dbConnect()
}

app.use(notFound)
app.use(errorhandler)

// Only start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
    })
}

module.exports = { app, server, io }
