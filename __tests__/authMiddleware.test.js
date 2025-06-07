const request = require("supertest")
const { app } = require("../index")
const jwt = require("jsonwebtoken")
const { authMiddleware } = require("../middlewares/authMiddleware")

describe("Authentication Middleware", () => {
    let mockReq
    let mockRes
    let nextFunction

    beforeEach(() => {
        mockReq = {
            headers: {},
            cookies: {},
        }
        mockRes = {
            status: jest.fn(() => mockRes),
            json: jest.fn(() => mockRes),
        }
        nextFunction = jest.fn()
    })

    const mockToken = jwt.sign(
        { id: "123", email: "test@example.com" },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "1d" }
    )

    test("should pass valid token in Authorization header", async () => {
        mockReq.headers.authorization = `Bearer ${mockToken}`

        await authMiddleware(mockReq, mockRes, nextFunction)

        expect(nextFunction).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
    })

    test("should pass valid token in cookie", async () => {
        mockReq.cookies.refreshToken = mockToken

        await authMiddleware(mockReq, mockRes, nextFunction)

        expect(nextFunction).toHaveBeenCalled()
        expect(mockRes.status).not.toHaveBeenCalled()
    })

    test("should reject invalid token", async () => {
        mockReq.headers.authorization = "Bearer invalid-token"

        await authMiddleware(mockReq, mockRes, nextFunction)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Not Authorized, Please Login",
        })
        expect(nextFunction).not.toHaveBeenCalled()
    })

    test("should reject missing token", async () => {
        await authMiddleware(mockReq, mockRes, nextFunction)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Not Authorized, No Token",
        })
        expect(nextFunction).not.toHaveBeenCalled()
    })

    test("should handle malformed token", async () => {
        mockReq.headers.authorization = "malformed-header"

        await authMiddleware(mockReq, mockRes, nextFunction)

        expect(mockRes.status).toHaveBeenCalledWith(401)
        expect(nextFunction).not.toHaveBeenCalled()
    })
})
