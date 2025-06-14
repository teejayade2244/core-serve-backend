const jwt = require("jsonwebtoken")
const User = require("../models/userDetails")
const asyncHandler = require("express-async-handler")

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token

    if (req.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies?.refreshToken) {
        token = req.cookies.refreshToken
    }
  
    if (!token) {
        console.log(
            "No token found from headers or cookies, rejecting request."
        )
        return res.status(401).json({ message: "Not Authorized, No Token" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        req.user = decoded
        next()
    } catch (error) {
        console.error("JWT Verification failed:", error.message)
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
