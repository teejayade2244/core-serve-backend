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
const metricsMiddleware = require("../middlewares/metricsMiddleware")

// const { Socket } = require("socket.io")
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

// Function to get a random city
function getRandomCamp() {
    const randomIndex = Math.floor(Math.random() * campsData.length)
    return campsData[randomIndex]
}

//generate random number
function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000)
}

function generateRandomStateNumber() {
    return Math.floor(10000 + Math.random() * 90000)
}

const createUser = async (req, res, next) => {
    const { matric, mobile, email } = req.body
    try {
        const findDetails = await User.findOne({
            matric: matric,
            mobile: mobile,
            email: email,
        })

        if (!findDetails) {
            // User with the provided details does not exist, so register the user
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
            } // Add camp and statePostedTo to the user data
            const registerNewUser = await User.create(newUser)
            metrics.registrationCount.inc()
            metrics.totalUsers.inc()
            res.status(201).json({
                message: "User registered successfully",
                user: registerNewUser,
            })
        } else {
            // User with the provided details is already registered
            res.status(409).json({ error: "User Already Registered" })
        }
    } catch (err) {
        console.error("Error while registering user:", err)
        res.status(500).json({ error: "Error while registering user" })
        metrics.apiErrors.inc({
            endpoint: "/api/user/register",
            error_type: err.message,
        })
    }
}

//login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, Password } = req.body
    //check if user exits
    const findUser = await User.findOne({ email })
    if (findUser && (await findUser.isPasswordMatched(Password))) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        metricsMiddleware.incrementLoginCount()
        metrics.activeLogins.inc()
        metrics.activeSessions.inc()
        // eslint-disable-next-line no-unused-vars
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser?.id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        })
    } else {
        metrics.failedLogins.inc()
        metrics.apiErrors.inc({
            endpoint: "/api/user/login",
            error_type: "Invalid Credentials",
        })
        metrics.apiErrors.inc({
            endpoint: "/api/user/login",
            error_type: "Failed Login Attempt",
        })
        return res.status(401).json({ error: "Invalid Credentials" })
        
    }
})

//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) {
        return res.status(400).json({ message: "No Refresh Token in Cookies" })
    }
    const refreshToken = cookie.refreshToken
    console.log(refreshToken)
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error("No Refresh Token present in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong")
        }
        const accessToken = generateToken(user?._id)
        res.json({ accessToken })
    })
})

//logout user
const logoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) {
        return res.status(400).json({ error: "No Refresh Token in Cookies" })
    }

    const refreshToken = cookie.refreshToken
    const user = await User.findOne({ refreshToken })
    metrics.activeSessions.dec()
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        })
        return res
            .status(204)
            .json({ message: "User not found, cookies cleared" })
    }

    await User.findOneAndUpdate(
        { refreshToken: refreshToken },
        {
            refreshToken: "",
        }
    )

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    })

    return res.status(200).json({ message: "User logged out successfully" })
    
})

//delete user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteUser = await User.findByIdAndDelete(id)
        if (!deleteUser) throw new Error("Unable To Delete Account")
        return res.status(200).json({ message: "Account Deleted Succesfully" })
        // res.json({
        //     deleteUser,
        // })
    } catch ({ message }) {
        return res.status(400).json({ message: message })
    }
})

// get user
const getaUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id
        const start = Date.now()
        const user = await User.findById(userId)
        const duration = (Date.now() - start) / 1000
        metrics.httpRequestDuration.observe(
            {
                method: "GET",
                route: "/api/user",
                status_code: 200,
            },
            duration
        )
        if (!user) {
            return res.status(404).json({ message: "User not Found" })
        }
        // console.log("User Data:", user) // Log the user data
        res.json(user)
    } catch (err) {
        metrics.apiErrors.inc({
            endpoint: "/api/user",
            error_type: err.message,
        })
        res.status(500).json({ message: err.message })
    }
})

// const userData = asyncHandler(async (req, res) => {
//     const { id } = req.params

//     // Validate the MongoDB ObjectId
//     try {
//         validateMongoDbId(id)
//     } catch (error) {
//         return res.status(400).json({ message: error.message }) // Return a 400 Bad Request on validation failure
//     }

//     try {
//         const user = await User.findById(id)

//         if (!user) {
//             return res.status(404).json({ message: "User not found" })
//         }

//         console.log("User Data:", user) // Log the user data
//         res.json({ user })
//     } catch (error) {
//         console.error("Error while querying user:", error)
//         res.status(500).json({ message: "Internal server error" })
//     }
// })

const userData = asyncHandler(async (req, res) => {
    const { identifier } = req.params
    try {
        let user
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            user = await User.findById(identifier)
        } else {
            user = await User.findOne({ email: identifier })
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        console.log("User Data:", user) // Log the user data
        res.json({ user })
    } catch (error) {
        console.error("Error while querying user:", error)
        res.status(500).json({ message: "Internal server error" })
    }
})
// const userData = asyncHandler(async (req, res) => {
//     const { email } = req.params
//     try {
//         const user = await User.findOne({ email })

//         if (!user) {
//             return res.status(404).json({ message: "User not found" })
//         }

//         console.log("User Data:", user) // Log the user data
//         res.json({ user })
//     } catch (error) {
//         console.error("Error while querying user:", error)
//         res.status(500).json({ message: "Internal server error" })
//     }
// })

// admin login
const loginAdmin = asyncHandler(async (req, res, next) => {
    const { email, Password } = req.body

    try {
        // check if user exists or not
        const findAdmin = await User.findOne({ email })

        if (!findAdmin) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        if (findAdmin.role !== "admin") {
            metrics.apiErrors.inc({
                endpoint: "/api/admin/login",
                error_type: "Unauthorized Admin Access",
            })
            return res.status(403).json({ message: "You are not an Admin" })
        }

        if (await findAdmin.isPasswordMatched(Password)) {
            const refreshToken = await generateRefreshToken(findAdmin._id)
            await User.findByIdAndUpdate(
                findAdmin.id,
                {
                    refreshToken: refreshToken,
                },
                { new: true }
            )

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })

            res.json({
                _id: findAdmin._id,
                firstname: findAdmin.firstname,
                lastname: findAdmin.lastname,
                email: findAdmin.email,
                mobile: findAdmin.mobile,
                token: generateToken(findAdmin._id),
            })
        } else {
            return res.status(401).json({ message: "Invalid Credentials" })
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred" })
        metrics.apiErrors.inc({
            endpoint: "/api/admin/login",
            error_type: error.message,
        })
    }
})

const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find()
        res.json(getUsers)
    } catch (error) {
        throw new Error(error)
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const { email } = req.params
    const updates = req.body

    User.findOneAndUpdate({ email }, updates, { new: true })
        .then(() =>
            res
                .status(200)
                .json({ message: "User details updated successfully" })
        )

        .catch((err) =>
            res
                .status(500)
                .json({ message: "Failed to update user details", error: err })
        )
})

//update Password
const updatePassword = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user
        const { currentPassword, Password } = req.body // get also the current password from request body
        metrics.userActivityMonitor.inc({
            activity_type: "password_update",
            user_role: "user",
        })
        validateMongoDbId(_id) // I assume this function validates the MongoDB ObjectId

        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Check if current password is correct
        if (!(await user.isPasswordMatched(currentPassword))) {
            return res
                .status(401)
                .json({ message: "Current password is incorrect" })
        }

        if (!Password || currentPassword === Password) {
            return res.status(400).json({
                message:
                    "Invalid password. New password is required and must be different from current password.",
            })
        }

        user.Password = Password // change user password
        const updatedUser = await user.save()

        res.json({
            message: "Password updated successfully",
            user: updatedUser,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
        metrics.apiErrors.inc({
            endpoint: "/api/user/password",
            error_type: error.message,
        })
    }
})

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res
                .status(404)
                .json({ error: "User not found with this email" })
        }

        const token = await user.createPasswordResetToken()
        await user.save()

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
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while processing the request",
        })
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
    } catch (error) {
        console.error("Error sending email:", error)
        res.status(500).json({ message: "Email could not be sent." })
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { Password } = req.body
        const { token } = req.params
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")
        const user = await User.findOne({
            PasswordResetToken: hashedToken,
            PasswordResetExpires: { $gt: Date.now() },
        })
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired token" })
        }

        user.Password = Password
        user.PasswordResetToken = undefined
        user.PasswordResetExpires = undefined
        await user.save()

        res.json({ success: true, message: "Password successfully reset" })
    } catch (error) {
        console.error("Error resetting password:", error)
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
        })
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
