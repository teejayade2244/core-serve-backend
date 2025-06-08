const asyncHandler = require("express-async-handler")
const User = require("../models/userDetails")
const { generateToken } = require("../config/jwToken")
const { generateRefreshToken } = require("../config/refreshtoken")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const validateMongoDbId = require("../config/MongodbId")
const { sendEmail } = require("../config/emailCtrl")
const nodemailer = require("nodemailer")
const { default: mongoose } = require("mongoose")
const { metrics } = require("../config/metricsConfig") 


const campsData = [
    {
        id: "AB",
        state: "Abia State",
        camp: "NYSC Permanent Orientation Camp, Umunna, Bende LGA",
    },
    {
        id: "AD",
        state: "Adamawa State",
        camp: "NYSC Permanent Orientation Camp, Lapondo Road, Damare, Girei LGA",
    },
    {
        id: "AK",
        state: "Akwa Ibom State",
        camp: "NYSC Permanent Orientation Camp, Ikot Itie Udung, Nsit Atai LGA",
    },
    {
        id: "AN",
        state: "Anambra State",
        camp: "NYSC Permanent Orientation Camp, Umuawulu/Mbaukwu Awka South LGA",
    },
    {
        id: "BA",
        state: "Bauchi State",
        camp: "NYSC Permanent Orientation Camp, KM 60 Wailo, Ganjuwa LGA",
    },
    {
        id: "BY",
        state: "Bayelsa State",
        camp: "Kaiama Grammar School, Kaiama, Kolokoma-Opokuma LGA",
    },
    {
        id: "BN",
        state: "Benue State",
        camp: "NYSC Permanent Orientation Camp, Wannune, Tarka LGA",
    },
    {
        id: "BO",
        state: "Borno State",
        camp: "College of Peace and Disaster Management, Babbar-Ruga Batsari Road, Katsina",
    },
    {
        id: "CR",
        state: "Cross River State",
        camp: "NYSC Permanent Orientation Camp, Obubra, Obubra LGA",
    },
    {
        id: "DT",
        state: "Delta State",
        camp: "NYSC Permanent Orientation Camp, Former Martins TTC, Issele-Uku, Aniocha North LGA",
    },
    {
        id: "EB",
        state: "Ebonyi State",
        camp: "NYSC Permanent Orientation Camp, Macgregor College, Afikpo LGA",
    },
    {
        id: "ED",
        state: "Edo State",
        camp: "Okada Grammar School, Okada, Ovia North-East LGA",
    },
    {
        id: "EK",
        state: "Ekiti State",
        camp: "NYSC Permanent Orientation Camp, Ise-Orun/Emure LGA",
    },
    {
        id: "EN",
        state: "Enugu State",
        camp: "NYSC Permanent Orientation Camp, Awgu LGA",
    },
    {
        id: "FC",
        state: "FCT (Abuja)",
        camp: "NYSC Permanent Orientation Camp, Kubwa, Bwari Area Council",
    },
    {
        id: "GM",
        state: "Gombe State",
        camp: "NYSC Temporary Orientation Camp, Science Technical College, Amada",
    },
    {
        id: "IM",
        state: "Imo State",
        camp: "NYSC Temporary Orientation Camp, Former Girl's Model Secondary School Eziama Obaire, Nkwerre LGA",
    },
    {
        id: "JG",
        state: "Jigawa State",
        camp: "NYSC Permanent Camp, opposite Army Barrack, Fanisua Dutse LGA",
    },
    {
        id: "KD",
        state: "Kaduna State",
        camp: "NYSC Permanent Orientation Camp, Kaduna – Abuja Road",
    },
    {
        id: "KN",
        state: "Kano State",
        camp: "NYSC Permanent Orientation Camp, Kusala Dam, Karaye, Karaye LGA",
    },
    {
        id: "KT",
        state: "Katsina State",
        camp: "Youth Multi-purpose Centre/ NYSC Permanent Orientation Camp, Mani Road",
    },
    {
        id: "KB",
        state: "Kebbi State",
        camp: "NYSC Permanent Orientation Camp, Dakingari LGA",
    },
    {
        id: "KG",
        state: "Kogi State",
        camp: "NYSC Permanent Orientation Camp, Asaya, Kabba LGA",
    },
    {
        id: "KW",
        state: "Kwara State",
        camp: "NYSC Permanent Orientation Camp, Yikpata, Edu LGA",
    },
    {
        id: "LA",
        state: "Lagos State",
        camp: "NYSC Permanent Orientation Camp, Iyana Ipaja, Agege",
    },
    {
        id: "NS",
        state: "Nassarawa State",
        camp: "Magaji Dan-Yamusa Permanent Orientation Camp, Keffi",
    },
    {
        id: "NG",
        state: "Niger State",
        camp: "NYSC Permanent Orientation Camp, Paiko",
    },
    {
        id: "OG",
        state: "Ogun State",
        camp: "NYSC Permanent Orientation Camp, Ikenne Road, Sagamu LGA",
    },
    {
        id: "OD",
        state: "Ondo State",
        camp: "NYSC Permanent Orientation Camp, Ikare-Akoko LGA",
    },
    {
        id: "OS",
        state: "Osun State",
        camp: "NYSC Permanent Orientation Camp, Aisu College Hospital Road, Ede North LGA",
    },
    {
        id: "OY",
        state: "Oyo State",
        camp: "Government Technical College, Iseyin LGA",
    },
    {
        id: "PL",
        state: "Plateau State",
        camp: "NYSC Permanent Orientation Camp, Mangu, Mangu LGA",
    },
    {
        id: "RV",
        state: "Rivers State",
        camp: "NYSC Permanent Orientation Camp, Nonwa-Gbam Tai LGA",
    },
    {
        id: "SO",
        state: "Sokoto State",
        camp: "NYSC Permanent Orientation Camp, Wamakko, Wamakko LGA",
    },
    {
        id: "TR",
        state: "Taraba State",
        camp: "NYSC Permanent Orientation Camp, Sibre Airport Road, Jalingo",
    },
    {
        id: "YB",
        state: "Yobe State",
        camp: "NYSC Permanent Orientation Camp Dazigau, Nangere LGA",
    },
    {
        id: "ZM",
        state: "Zamfara",
        camp: "NYSC Permanent Orientation Camp, Beside FRSC Office, Tsafe LGA",
    },
]

function getRandomCamp() {
    const randomIndex = Math.floor(Math.random() * campsData.length)
    return campsData[randomIndex]
}

function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000)
}

function generateRandomStateNumber() {
    return Math.floor(10000 + Math.random() * 90000)
}

const createUser = asyncHandler(async (req, res, next) => {
    const start = Date.now()
    const { matric, mobile, email } = req.body
    try {
        const dbStart = Date.now()
        const findDetails = await User.findOne({
            matric: matric,
            mobile: mobile,
            email: email,
        })
        metrics.dbQueryDuration.observe(
            { query_type: "findOne", status: "success" },
            (Date.now() - dbStart) / 1000
        )

        if (!findDetails) {
            const randomCamp = getRandomCamp()
            const newUser = {
                ...req.body,
                statePostedTo: randomCamp.state,
                OrientationCamp: randomCamp.camp,
                StateCode: `${
                    randomCamp.id
                }/23A/${generateRandomStateNumber()}`,
                CallUpNumber: `CORE/SERVE/${generateRandomNumber()}`,
                PPA: "",
            }
            const createDbStart = Date.now()
            const registerNewUser = await User.create(newUser)
            metrics.dbQueryDuration.observe(
                { query_type: "create", status: "success" },
                (Date.now() - createDbStart) / 1000
            )

            metrics.registrationCount.inc() // Increment registration count
            metrics.totalUsers.inc() // Increment total users count
            res.status(201).json({
                message: "User registered successfully",
                user: registerNewUser,
            })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/register",
                    status_code: 201,
                },
                (Date.now() - start) / 1000
            )
        } else {
            res.status(409).json({ error: "User Already Registered" })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/register",
                    status_code: 409,
                },
                (Date.now() - start) / 1000
            )
        }
    } catch (err) {
        console.error("Error while registering user:", err)
        res.status(500).json({ error: "Error while registering user" })
        metrics.apiErrors.inc({
            endpoint: "/api/user/register",
            error_type: err.message,
        })
        metrics.httpRequestDuration.observe(
            { method: "POST", route: "/api/user/register", status_code: 500 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "create", status: "failure" },
            (Date.now() - start) / 1000
        ) // If DB error
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const start = Date.now()
    const { email, Password } = req.body
    const dbStart = Date.now()
    const findUser = await User.findOne({ email })
    metrics.dbQueryDuration.observe(
        { query_type: "findOne", status: "success" },
        (Date.now() - dbStart) / 1000
    )

    if (findUser && (await findUser.isPasswordMatched(Password))) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        metrics.activeLogins.inc() // Increment successful login count
        metrics.activeSessions.inc() // Increment active sessions

        const updateDbStart = Date.now()
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            { refreshToken: refreshToken },
            { new: true }
        )
        metrics.dbQueryDuration.observe(
            { query_type: "findByIdAndUpdate", status: "success" },
            (Date.now() - updateDbStart) / 1000
        )

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production", // Add secure flag for production
            sameSite: "Lax", // Recommended for security
        })
        res.json({
            _id: findUser?.id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        })
        metrics.httpRequestDuration.observe(
            { method: "POST", route: "/api/user/login", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } else {
        metrics.failedLogins.inc() // Increment failed login count
        metrics.apiErrors.inc({
            endpoint: "/api/user/login",
            error_type: "Invalid Credentials",
        })
        res.status(401).json({ error: "Invalid Credentials" })
        metrics.httpRequestDuration.observe(
            { method: "POST", route: "/api/user/login", status_code: 401 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "findOne", status: "failure" },
            (Date.now() - dbStart) / 1000
        ) // If find fails or password mismatch
    }
})

const handleRefreshToken = asyncHandler(async (req, res) => {
    const start = Date.now()
    const cookie = req.cookies
    if (!cookie?.refreshToken) {
        res.status(400).json({ message: "No Refresh Token in Cookies" })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/refresh", status_code: 400 },
            (Date.now() - start) / 1000
        )
        metrics.apiErrors.inc({
            endpoint: "/api/user/refresh",
            error_type: "No Refresh Token",
        })
        return
    }
    const refreshToken = cookie.refreshToken
    // console.log(refreshToken) // Removed logging sensitive data
    const dbStart = Date.now()
    const user = await User.findOne({ refreshToken })
    metrics.dbQueryDuration.observe(
        { query_type: "findOne", status: "success" },
        (Date.now() - dbStart) / 1000
    )

    if (!user) {
        res.status(400).json({
            message: "No Refresh Token present in db or not matched",
        })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/refresh", status_code: 400 },
            (Date.now() - start) / 1000
        )
        metrics.apiErrors.inc({
            endpoint: "/api/user/refresh",
            error_type: "Refresh Token Mismatch",
        })
        return
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            res.status(401).json({
                message: "Not Authorized, Please Login (Token Invalid/Expired)",
            })
            metrics.httpRequestDuration.observe(
                { method: "GET", route: "/api/user/refresh", status_code: 401 },
                (Date.now() - start) / 1000
            )
            metrics.apiErrors.inc({
                endpoint: "/api/user/refresh",
                error_type: "JWT Verification Failed",
            })
        } else {
            const accessToken = generateToken(user?._id)
            res.json({ accessToken })
            metrics.httpRequestDuration.observe(
                { method: "GET", route: "/api/user/refresh", status_code: 200 },
                (Date.now() - start) / 1000
            )
        }
    })
})

const logoutUser = asyncHandler(async (req, res) => {
    const start = Date.now()
    const cookie = req.cookies
    if (!cookie?.refreshToken) {
        res.status(400).json({ error: "No Refresh Token in Cookies" })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/logout", status_code: 400 },
            (Date.now() - start) / 1000
        )
        metrics.apiErrors.inc({
            endpoint: "/api/user/logout",
            error_type: "No Refresh Token",
        })
        return
    }

    const refreshToken = cookie.refreshToken
    const dbStart = Date.now()
    const user = await User.findOne({ refreshToken })
    metrics.dbQueryDuration.observe(
        { query_type: "findOne", status: "success" },
        (Date.now() - dbStart) / 1000
    )

    metrics.activeSessions.dec() // Decrement active sessions

    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
        })
        res.status(204).json({ message: "User not found, cookies cleared" })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/logout", status_code: 204 },
            (Date.now() - start) / 1000
        )
        return
    }

    const updateDbStart = Date.now()
    await User.findOneAndUpdate(
        { refreshToken: refreshToken },
        { refreshToken: "" }
    )
    metrics.dbQueryDuration.observe(
        { query_type: "findOneAndUpdate", status: "success" },
        (Date.now() - updateDbStart) / 1000
    )

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
    })

    res.status(200).json({ message: "User logged out successfully" })
    metrics.httpRequestDuration.observe(
        { method: "GET", route: "/api/user/logout", status_code: 200 },
        (Date.now() - start) / 1000
    )
})

const deleteUser = asyncHandler(async (req, res) => {
    const start = Date.now()
    const { id } = req.params
    try {
        validateMongoDbId(id) // Ensure ID is valid
        const dbStart = Date.now()
        const deleteUser = await User.findByIdAndDelete(id)
        metrics.dbQueryDuration.observe(
            { query_type: "findByIdAndDelete", status: "success" },
            (Date.now() - dbStart) / 1000
        )

        if (!deleteUser) {
            res.status(404).json({
                message: "Unable To Delete Account, User Not Found",
            })
            metrics.httpRequestDuration.observe(
                { method: "DELETE", route: "/api/user/:id", status_code: 404 },
                (Date.now() - start) / 1000
            )
            return
        }
        metrics.totalUsers.dec() // Decrement total users count
        res.status(200).json({ message: "Account Deleted Succesfully" })
        metrics.httpRequestDuration.observe(
            { method: "DELETE", route: "/api/user/:id", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } catch (err) {
        console.error("Error deleting user:", err)
        res.status(500).json({ message: err.message })
        metrics.apiErrors.inc({
            endpoint: "/api/user/:id",
            error_type: err.message,
        })
        metrics.httpRequestDuration.observe(
            { method: "DELETE", route: "/api/user/:id", status_code: 500 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "findByIdAndDelete", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

const getaUser = asyncHandler(async (req, res) => {
    const start = Date.now()
    try {
        const userId = req.user.id
        const dbStart = Date.now()
        const user = await User.findById(userId)
        metrics.dbQueryDuration.observe(
            { query_type: "findById", status: "success" },
            (Date.now() - dbStart) / 1000
        )

        if (!user) {
            res.status(404).json({ message: "User not Found" })
            metrics.httpRequestDuration.observe(
                {
                    method: "GET",
                    route: "/api/user/user-data",
                    status_code: 404,
                },
                (Date.now() - start) / 1000
            )
            return
        }
        res.json(user)
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/user-data", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } catch (err) {
        console.error("Error fetching user data:", err)
        metrics.apiErrors.inc({
            endpoint: "/api/user/user-data",
            error_type: err.message,
        })
        res.status(500).json({ message: err.message })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/user-data", status_code: 500 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "findById", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

const userData = asyncHandler(async (req, res) => {
    const start = Date.now()
    const { identifier } = req.params
    try {
        let user
        const dbStart = Date.now()
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            user = await User.findById(identifier)
            metrics.dbQueryDuration.observe(
                { query_type: "findById", status: "success" },
                (Date.now() - dbStart) / 1000
            )
        } else {
            user = await User.findOne({ email: identifier })
            metrics.dbQueryDuration.observe(
                { query_type: "findOne", status: "success" },
                (Date.now() - dbStart) / 1000
            )
        }

        if (!user) {
            res.status(404).json({ message: "User not found" })
            metrics.httpRequestDuration.observe(
                {
                    method: "GET",
                    route: "/api/user/:identifier",
                    status_code: 404,
                },
                (Date.now() - start) / 1000
            )
            return
        }
        // console.log("User Data:", user) // Removed sensitive logging
        res.json({ user })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/:identifier", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } catch (error) {
        console.error("Error while querying user:", error)
        metrics.apiErrors.inc({
            endpoint: "/api/user/:identifier",
            error_type: error.message,
        })
        res.status(500).json({ message: "Internal server error" })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/:identifier", status_code: 500 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "lookup", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

const loginAdmin = asyncHandler(async (req, res, next) => {
    const start = Date.now()
    const { email, Password } = req.body

    try {
        const dbStart = Date.now()
        const findAdmin = await User.findOne({ email })
        metrics.dbQueryDuration.observe(
            { query_type: "findOne", status: "success" },
            (Date.now() - dbStart) / 1000
        )

        if (!findAdmin) {
            res.status(401).json({ message: "Invalid Credentials" })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/admin-login",
                    status_code: 401,
                },
                (Date.now() - start) / 1000
            )
            metrics.failedLogins.inc({ type: "admin" }) // Optionally track admin failed logins
            return
        }

        if (findAdmin.role !== "admin") {
            metrics.apiErrors.inc({
                endpoint: "/api/user/admin-login",
                error_type: "Unauthorized Admin Access",
            })
            res.status(403).json({ message: "You are not an Admin" })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/admin-login",
                    status_code: 403,
                },
                (Date.now() - start) / 1000
            )
            return
        }

        if (await findAdmin.isPasswordMatched(Password)) {
            const refreshToken = await generateRefreshToken(findAdmin._id)
            metrics.activeLogins.inc({ type: "admin" }) // Increment admin successful login count
            metrics.activeSessions.inc() // Increment active sessions for admin

            const updateDbStart = Date.now()
            await User.findByIdAndUpdate(
                findAdmin.id,
                { refreshToken: refreshToken },
                { new: true }
            )
            metrics.dbQueryDuration.observe(
                { query_type: "findByIdAndUpdate", status: "success" },
                (Date.now() - updateDbStart) / 1000
            )

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
            })

            res.json({
                _id: findAdmin._id,
                firstname: findAdmin.firstname,
                lastname: findAdmin.lastname,
                email: findAdmin.email,
                mobile: findAdmin.mobile,
                token: generateToken(findAdmin._id),
            })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/admin-login",
                    status_code: 200,
                },
                (Date.now() - start) / 1000
            )
        } else {
            res.status(401).json({ message: "Invalid Credentials" })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/admin-login",
                    status_code: 401,
                },
                (Date.now() - start) / 1000
            )
            metrics.failedLogins.inc({ type: "admin" }) // Increment admin failed logins
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred" })
        metrics.apiErrors.inc({
            endpoint: "/api/user/admin-login",
            error_type: error.message,
        })
        metrics.httpRequestDuration.observe(
            {
                method: "POST",
                route: "/api/user/admin-login",
                status_code: 500,
            },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "loginAdmin", status: "failure" },
            (Date.now() - start) / 1000
        ) // General db error for admin login
    }
})

const getallUser = asyncHandler(async (req, res) => {
    const start = Date.now()
    try {
        const dbStart = Date.now()
        const getUsers = await User.find()
        metrics.dbQueryDuration.observe(
            { query_type: "find", status: "success" },
            (Date.now() - dbStart) / 1000
        )

        res.json(getUsers)
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/all-Users", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } catch (error) {
        console.error("Error getting all users:", error)
        res.status(500).json({ message: error.message })
        metrics.apiErrors.inc({
            endpoint: "/api/user/all-Users",
            error_type: error.message,
        })
        metrics.httpRequestDuration.observe(
            { method: "GET", route: "/api/user/all-Users", status_code: 500 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "find", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const start = Date.now()
    const { email } = req.params
    const updates = req.body

    try {
        const dbStart = Date.now()
        const updatedUser = await User.findOneAndUpdate({ email }, updates, {
            new: true,
        })
        metrics.dbQueryDuration.observe(
            { query_type: "findOneAndUpdate", status: "success" },
            (Date.now() - dbStart) / 1000
        )

        if (!updatedUser) {
            res.status(404).json({ message: "User not found for update" })
            metrics.httpRequestDuration.observe(
                { method: "PUT", route: "/api/user/:email", status_code: 404 },
                (Date.now() - start) / 1000
            )
            return
        }

        res.status(200).json({
            message: "User details updated successfully",
            user: updatedUser,
        })
        metrics.httpRequestDuration.observe(
            { method: "PUT", route: "/api/user/:email", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } catch (err) {
        console.error("Error updating user:", err)
        res.status(500).json({
            message: "Failed to update user details",
            error: err.message,
        })
        metrics.apiErrors.inc({
            endpoint: "/api/user/:email",
            error_type: err.message,
        })
        metrics.httpRequestDuration.observe(
            { method: "PUT", route: "/api/user/:email", status_code: 500 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "findOneAndUpdate", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

const updatePassword = asyncHandler(async (req, res) => {
    const start = Date.now()
    try {
        const { _id } = req.user
        const { currentPassword, Password } = req.body

        validateMongoDbId(_id)

        const dbFindStart = Date.now()
        const user = await User.findById(_id)
        metrics.dbQueryDuration.observe(
            { query_type: "findById", status: "success" },
            (Date.now() - dbFindStart) / 1000
        )

        if (!user) {
            res.status(404).json({ message: "User not found" })
            metrics.httpRequestDuration.observe(
                {
                    method: "PUT",
                    route: "/api/user/password",
                    status_code: 404,
                },
                (Date.now() - start) / 1000
            )
            return
        }

        if (!(await user.isPasswordMatched(currentPassword))) {
            res.status(401).json({ message: "Current password is incorrect" })
            metrics.httpRequestDuration.observe(
                {
                    method: "PUT",
                    route: "/api/user/password",
                    status_code: 401,
                },
                (Date.now() - start) / 1000
            )
            metrics.apiErrors.inc({
                endpoint: "/api/user/password",
                error_type: "Incorrect Current Password",
            })
            return
        }

        if (!Password || currentPassword === Password) {
            res.status(400).json({
                message:
                    "Invalid password. New password is required and must be different from current password.",
            })
            metrics.httpRequestDuration.observe(
                {
                    method: "PUT",
                    route: "/api/user/password",
                    status_code: 400,
                },
                (Date.now() - start) / 1000
            )
            metrics.apiErrors.inc({
                endpoint: "/api/user/password",
                error_type: "Invalid New Password",
            })
            return
        }

        user.Password = Password
        const dbSaveStart = Date.now()
        const updatedUser = await user.save()
        metrics.dbQueryDuration.observe(
            { query_type: "save", status: "success" },
            (Date.now() - dbSaveStart) / 1000
        )
        metrics.passwordUpdates.inc() // Increment password updates count

        res.json({
            message: "Password updated successfully",
            user: updatedUser,
        })
        metrics.httpRequestDuration.observe(
            { method: "PUT", route: "/api/user/password", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } catch (error) {
        console.error("Error updating password:", error)
        res.status(500).json({ message: "Server error" })
        metrics.apiErrors.inc({
            endpoint: "/api/user/password",
            error_type: error.message,
        })
        metrics.httpRequestDuration.observe(
            { method: "PUT", route: "/api/user/password", status_code: 500 },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "updatePassword", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const start = Date.now()
    const { email } = req.body

    try {
        const dbFindStart = Date.now()
        const user = await User.findOne({ email })
        metrics.dbQueryDuration.observe(
            { query_type: "findOne", status: "success" },
            (Date.now() - dbFindStart) / 1000
        )

        if (!user) {
            res.status(404).json({ error: "User not found with this email" })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/forgot-password-token",
                    status_code: 404,
                },
                (Date.now() - start) / 1000
            )
            return
        }

        const token = await user.createPasswordResetToken()
        const dbSaveStart = Date.now()
        await user.save()
        metrics.dbQueryDuration.observe(
            { query_type: "save", status: "success" },
            (Date.now() - dbSaveStart) / 1000
        )

        const resetURL = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: black;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 400px;
            margin: auto;
            padding: 20px;
            background-color: black;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            text-align: center;
        }

        .header {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: white;
        }

        .message {
            color: white;
            margin-bottom: 20px;
        }

        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #22C55E;
            text-decoration: none;
            border-radius: 5px;
        }

        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="header">Password Reset</h1>
        <p class="message">You are receiving this email because a password reset request was made for your account.</p>
        <p class="message">Please click the button below to reset your password:</p>
        <a class="btn" href='http://aca3a88e8570b4e189a48b8fba0f708a-536087669.eu-west-2.elb.amazonaws.com:5000/reset-password/${token}'>Reset Password</a>
        <p class="message">If you did not request a password reset, no further action is required.</p>
        <p class="footer">Thank you!</p>
    </div>
</body>
</html>`

        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            html: resetURL,
        }

        sendEmail(data)

        res.status(200).json({
            successMessage: "Password reset token sent successfully",
        })
        metrics.httpRequestDuration.observe(
            {
                method: "POST",
                route: "/api/user/forgot-password-token",
                status_code: 200,
            },
            (Date.now() - start) / 1000
        )
    } catch (error) {
        console.error("Error sending forgot password token:", error)
        res.status(500).json({
            error: "An error occurred while processing the request",
        })
        metrics.apiErrors.inc({
            endpoint: "/api/user/forgot-password-token",
            error_type: error.message,
        })
        metrics.httpRequestDuration.observe(
            {
                method: "POST",
                route: "/api/user/forgot-password-token",
                status_code: 500,
            },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "forgotPasswordToken", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
})

const correctionMail = asyncHandler(async (req, res) => {
    const start = Date.now()
    const { email, Correction, CallUpNumber, FirstName, LastName, ID } =
        req.body

    try {
        const mailOptions = {
            from: email,
            to: process.env.EMAIL,
            subject: `Correction Request from ${email}, ${CallUpNumber}`,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: black;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 400px;
            margin: auto;
            padding: 20px;
            background-color: black;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            text-align: center;
        }

        .header {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            color: white;
        }

        .message {
            color: white;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="message">Correction Request</h1>
        <p class="message">You are receiving this email because a user ${email}, ${CallUpNumber} requested for correction of Name</p>
        <h2 class="message">Correction Type:</h2>
        <p class="message">${Correction}</p>
        <h2 class="message">First Name Correction:</h2>
        <p class="message">${FirstName}</p>
        <h2 class="message">Last Name Correction:</h2>
        <p class="message">${LastName}</p>
        <h2 class="message">Call up Number:</h2>
        <p class="message">${CallUpNumber}</p>
           <h2 class="message">User ID</h2>
        <p class="message">${ID}</p>
    </div>
</body>
</html>`,
        }

        const info = await transporter.sendMail(mailOptions)

        console.log("Email sent: " + info.response)
        res.status(200).json({ message: "Your Response has Been Recorded!" })
        metrics.httpRequestDuration.observe(
            { method: "POST", route: "/api/user/send-mail", status_code: 200 },
            (Date.now() - start) / 1000
        )
    } catch (error) {
        console.error("Error sending email:", error)
        res.status(500).json({ message: "Email could not be sent." })
        metrics.apiErrors.inc({
            endpoint: "/api/user/send-mail",
            error_type: error.message,
        })
        metrics.httpRequestDuration.observe(
            { method: "POST", route: "/api/user/send-mail", status_code: 500 },
            (Date.now() - start) / 1000
        )
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const start = Date.Now()
    try {
        const { Password } = req.body
        const { token } = req.params
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")

        const dbFindStart = Date.now()
        const user = await User.findOne({
            PasswordResetToken: hashedToken,
            PasswordResetExpires: { $gt: Date.now() },
        })
        metrics.dbQueryDuration.observe(
            { query_type: "findOne", status: "success" },
            (Date.now() - dbFindStart) / 1000
        )

        if (!user) {
            res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            })
            metrics.httpRequestDuration.observe(
                {
                    method: "POST",
                    route: "/api/user/reset-password/:token",
                    status_code: 400,
                },
                (Date.now() - start) / 1000
            )
            return
        }

        user.Password = Password
        user.PasswordResetToken = undefined
        user.PasswordResetExpires = undefined
        const dbSaveStart = Date.now()
        await user.save()
        metrics.dbQueryDuration.observe(
            { query_type: "save", status: "success" },
            (Date.now() - dbSaveStart) / 1000
        )

        res.json({ success: true, message: "Password successfully reset" })
        metrics.httpRequestDuration.observe(
            {
                method: "POST",
                route: "/api/user/reset-password/:token",
                status_code: 200,
            },
            (Date.now() - start) / 1000
        )
    } catch (error) {
        console.error("Error resetting password:", error)
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
        })
        metrics.apiErrors.inc({
            endpoint: "/api/user/reset-password/:token",
            error_type: error.message,
        })
        metrics.httpRequestDuration.observe(
            {
                method: "POST",
                route: "/api/user/reset-password/:token",
                status_code: 500,
            },
            (Date.now() - start) / 1000
        )
        metrics.dbQueryDuration.observe(
            { query_type: "resetPassword", status: "failure" },
            (Date.now() - start) / 1000
        )
    }
})

module.exports = {
    createUser,
    updatePassword,
    getaUser,
    loginUser,
    getallUser,
    deleteUser,
    handleRefreshToken,
    logoutUser,
    loginAdmin,
    updateUser,
    userData,
    forgotPasswordToken,
    resetPassword,
    correctionMail,
}
