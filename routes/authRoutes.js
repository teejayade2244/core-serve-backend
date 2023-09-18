const express = require("express")
const {
    createUser,
    loginUser,
    deleteUser,
    getaUser,
    handleRefreshToken,
    logoutUser,
    updateUser,
    loginAdmin,
    getallUser,
    userData,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    correctionMail,
    // uploadFile,
} = require("../controller/userCtrl")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

const router = express.Router()

router.post("/register", createUser)

router.post("/forgot-password-token", forgotPasswordToken)

router.post("/reset-password/:token", resetPassword)

router.get("/refresh", handleRefreshToken)

router.post("/login", loginUser)

router.get("/logout", logoutUser)

router.get("/all-Users", getallUser)

router.put("/password", authMiddleware, updatePassword)

router.get("/user-data", authMiddleware, getaUser)

router.post("/send-mail", authMiddleware, correctionMail)

router.get("/:identifier", userData)

router.post("/admin-login", loginAdmin)

router.put("/:email", authMiddleware, isAdmin, updateUser)

router.delete("/:id", deleteUser)

module.exports = router
