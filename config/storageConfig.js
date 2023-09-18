const multer = require("multer")
const path = require("path")

// storage config
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, "../uploads"))
    },
    filename: (req, file, callback) => {
        const filename = `image-${Date.now()}.${file.originalname}`
        callback(null, filename)
    },
})

// filter
const filefilter = (req, file, callback) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        callback(null, true)
    } else {
        callback(new Error("Only .png, .jpg, and .jpeg files are allowed"))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: filefilter,
})

module.exports = upload
