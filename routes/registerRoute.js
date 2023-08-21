const express = require("express")
const {
    registerUser,
    deleteDetails,
    getaUserDetails,
    updateUser,
} = require("../controller/registerCtrl")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

const router = express.Router()

router.post("/", registerUser)
router.delete("/:id", authMiddleware, isAdmin, deleteDetails)
router.put("/:id", authMiddleware, isAdmin, updateUser)
router.get("/:id", authMiddleware, isAdmin, getaUserDetails)

module.exports = router
