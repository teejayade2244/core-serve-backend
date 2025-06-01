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
const server = http.createServer(app)
const mongoose = require("mongoose")

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
}) // Create a socket.io instance

io.on("connection", (socket) => {
    console.log("New client connected")

    // Disconnect listener
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

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.get("/ready", async (req, res) => {
    try {
        // Check database connection
        await mongoose.connection.db.admin().ping()
        res.status(200).json({ status: "ready" })
    } catch (error) {
        res.status(503).json({ status: "not ready", error: error.message })
    }
})
// Move database connection logic here
if (process.env.NODE_ENV !== "test") {
    dbConnect()
}

app.use(notFound)
app.use(errorhandler)

// Only start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`)
    })
}

module.exports = { app }


