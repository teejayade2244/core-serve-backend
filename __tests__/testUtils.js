const mongoose = require("mongoose")
const User = require("../models/userDetails")

const clearTestDB = async () => {
    if (mongoose.connection.readyState === 1) {
        try {
            await User.deleteMany({})
        } catch (error) {
            console.error("Clear DB Error:", error)
            throw error
        }
    }
}

const setupTestDB = () => {
    beforeEach(async () => {
        try {
            await clearTestDB()
        } catch (error) {
            console.error("Setup Error:", error)
            throw error
        }
    })
}

module.exports = { clearTestDB, setupTestDB }
