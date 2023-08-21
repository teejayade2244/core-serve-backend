const mongoose = require("mongoose")

const dbConnect = () => {
    mongoose
        .connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("Connected to MongoDB")
        })
        .catch((error) => {
            console.log("Error connecting to MongoDB", error)
        })
}

module.exports = { dbConnect }
