const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

let mongoServer

const connectTestDB = async () => {
    try {
        mongoServer = await MongoMemoryServer.create()
        const mongoUri = mongoServer.getUri()

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Test database connected")
    } catch (error) {
        console.error("Test database connection error:", error)
        throw error
    }
}

const disconnectTestDB = async () => {
    try {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
        await mongoServer.stop()
    } catch (error) {
        console.error("Test database disconnect error:", error)
        throw error
    }
}

const clearTestDB = async () => {
    if (!mongoose.connection.db) return
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany()
    }
}

module.exports = { connectTestDB, disconnectTestDB, clearTestDB }
