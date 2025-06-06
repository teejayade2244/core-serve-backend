jest.setTimeout(30000)

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

process.env.NODE_ENV = "test"
process.env.MONGODB_URL = "mongodb://localhost:27017/test"

beforeAll(async () => {
    process.on("unhandledRejection", (err) => {
        console.error("Unhandled rejection:", err)
    })
})
