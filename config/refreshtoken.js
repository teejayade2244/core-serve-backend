const jwt = require("jsonwebtoken")

function generateRefreshToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET_TOKEN, { expiresIn: "3d" })
}

module.exports = { generateRefreshToken }
