const express = require("express")
const app = express()
const dotenv = require("dotenv").config() // Keep this for now if you're still using .env for PORT
const cors = require("cors")
const bodyParser = require("body-parser")
const authRouter = require("./routes/authRoutes")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const { dbConnect } = require("./config/dbConnect")
const { notFound, errorhandler } = require("./middlewares/errorHandler")
const helmet = require("helmet")
const PORT = process.env.PORT || 4000 // Keep reading from process.env for now
const http = require("http")
const mongoose = require("mongoose")

// --- CORRECTED SERVER INITIALIZATION ---
// Create the HTTP server using the express app
const server = http.createServer(app)

// Initialize Socket.IO with the HTTP server
const io = require("socket.io")(server, {
    // Attach Socket.IO to the 'server' instance
    cors: {
        origin: "http://a0bd629c8c1994870836f96ba4cd1321-1704283740.eu-west-2.elb.amazonaws.com:3000/", // Adjust as per your frontend's origin
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
})

io.on("connection", (socket) => {
    console.log("New client connected")
    socket.on("disconnect", () => console.log("Client disconnected"))
})

app.use(cors())
app.use(morgan("dev"))
app.set("io", io)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(cookieParser())
app.use("/api/user", authRouter)

// --- Health and Readiness Probes (ensure these are defined before generic error handlers) ---
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

if (process.env.NODE_ENV !== "test") {
    dbConnect() // Assuming dbConnect still reads from process.env for now
}

app.use(notFound)
app.use(errorhandler)

// Only start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
    // --- LISTEN ON THE 'SERVER' INSTANCE ---
    server.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
    })
}

module.exports = { app, server, io } // Export server and io for testing or other modules if needed
