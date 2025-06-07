const jwt = require("jsonwebtoken")
const User = require("../models/userDetails")
const asyncHandler = require("express-async-handler")

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token

    console.log("Auth Middleware Hit!")
    console.log("Request Headers:", req.headers) // See if Authorization header is present
    console.log("Request Cookies:", req.cookies) // See if refreshToken cookie is present

    if (req.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
        console.log(
            "Token found from Authorization header:",
            token ? "YES" : "NO"
        )
    } else if (req.cookies?.refreshToken) {
        token = req.cookies.refreshToken
        console.log(
            "Token found from refreshToken cookie:",
            token ? "YES" : "NO"
        )
    } else {
        console.log("No token found from headers or cookies.")
    }

    if (!token) {
        return res.status(401).json({ message: "Not Authorized, No Token" })
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "test-secret"
        )
        console.log("Token successfully verified. Decoded:", decoded)
        req.user = decoded
        next()
    } catch (error) {
        console.error("JWT Verification failed:", error.message) // This will tell you if it's expired etc.
        res.status(401).json({ message: "Not Authorized, Please Login" })
    }
})

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user
    const adminUser = await User.findOne({ email })
    if (adminUser.role !== "admin") {
        throw new Error("You are not an admin")
    } else {
        next()
    }
})
module.exports = { authMiddleware, isAdmin }
