require("dotenv").config()
const { MongoMemoryServer } = require("mongodb-memory-server")
const mongoose = require("mongoose")

let mongod

beforeAll(async () => {
    try {
        mongod = await MongoMemoryServer.create()
        const uri = mongod.getUri()

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 120000,
            socketTimeoutMS: 120000,
        })
        console.log("MongoDB Memory Server connected")
    } catch (error) {
        console.error("MongoDB Setup Error:", error)
        throw error
    }

    // Setup unhandled rejection listener
    process.on("unhandledRejection", (err) => {
        console.error("Unhandled rejection:", err)
    })
})

afterAll(async () => {
    try {
        await mongoose.connection.close()
        if (mongod) {
            await mongod.stop()
        }
    } catch (error) {
        console.error("Cleanup Error:", error)
        throw error
    }
})

jest.setTimeout(120000)

// Only suppress log and debug, keep errors visible
const originalConsole = { ...console }
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: originalConsole.info,
    warn: originalConsole.warn,
    error: originalConsole.error,
}

// Set environment variables
process.env.NODE_ENV = "test"
process.env.MONGODB_URL = "mongodb://localhost:27017/test"
