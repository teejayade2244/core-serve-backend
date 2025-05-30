jest.setTimeout(30000)

process.env.NODE_ENV = "test"
process.env.MONGODB_URL = "mongodb://localhost:27017/test"

beforeAll(async () => {
    process.on("unhandledRejection", (err) => {
        console.error("Unhandled rejection:", err)
    })
})
