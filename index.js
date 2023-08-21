const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const cors = require("cors")
const bodyParser = require("body-parser")
const authRouter = require("./routes/authRoutes")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")

const { dbConnect } = require("./config/dbConnect")
const { notFound, errorhandler } = require("./middlewares/errorHandler")
const helmet = require("helmet")
const PORT = process.env.PORT || 4000

dbConnect()
app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
app.use(cookieParser())
app.use("/api/user", authRouter)

app.use(notFound)
app.use(errorhandler)

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})
