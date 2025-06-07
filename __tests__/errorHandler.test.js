const { errorHandler } = require("../middlewares/errorHandler")

describe("Error Handler Middleware", () => {
    let mockReq
    let mockRes
    let nextFunction

    beforeEach(() => {
        mockReq = {}
        mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(() => mockRes),
        }
        nextFunction = jest.fn()
    })

    test("should handle validation error", () => {
        const err = new Error("Validation failed")
        err.name = "ValidationError"

        errorHandler(err, mockReq, mockRes, nextFunction)

        expect(mockRes.status).toHaveBeenCalledWith(400)
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: "Validation failed",
        })
    })

    test("should handle unauthorized error", () => {
        const err = new Error("Unauthorized")
        err.name = "UnauthorizedError"

        errorHandler(err, mockReq, mockRes, nextFunction)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: "Unauthorized",
        })
    })

    test("should handle generic error", () => {
        const err = new Error("Something went wrong")

        errorHandler(err, mockReq, mockRes, nextFunction)

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            message: "Something went wrong",
        })
    })
})
