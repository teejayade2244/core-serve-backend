const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
            index: true,
        },
        lastname: {
            type: String,
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        gender: {
            type: String,
            required: true,
        },
        school: {
            type: String,
            required: true,
            description: "The name of the school",
        },
        OrientationCamp: {
            type: String,
            required: true,
        },
        statePostedTo: {
            type: String,
            required: true,
        },
        StateCode: {
            type: String,
            required: true,
            unique: true,
        },
        PPA: {
            type: String,
        },
        address: {
            type: String,
            required: true,
            description: "The address of the person",
        },
        img: {
            data: Buffer,
            contentType: String,
        },
        course: {
            type: String,
            required: true,
            description: "The course the person is taking",
        },
        stateOfOrigin: {
            type: String,
            required: true,
            description: "The marital status of the person",
        },
        matric: {
            type: String,
            required: true,
            unique: true,
            description: "The matriculation number",
        },
        qualification: {
            type: String,
            required: true,
            description: "The qualification of the person",
        },
        from: {
            type: String,
            required: true,
            format: Date,
            description: "The start date",
        },
        status: {
            type: String,
            required: true,
            description: "The marital status of the person",
        },
        to: {
            type: String,
            required: true,
            format: Date,
            description: "The end date",
        },
        CallUpNumber: {
            type: String,
            required: true,
            description: "Call up Number",
            unique: true,
        },
        Batch: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: "User",
        },
        refreshToken: {
            type: String,
        },
        Password: {
            type: String,
            required: true,
        },
        PasswordResetToken: String,
        PasswordResetExpires: Date,
        PasswordChangedAt: Date,
    },
    {
        timestamps: true,
    }
)

//hash password
userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSaltSync(10)
    this.Password = await bcrypt.hash(this.Password, salt)
})

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.Password)
}
userSchema.methods.createPasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString("hex")
    this.PasswordResetToken = crypto
        .createHash("sha256")
        .update(resettoken)
        .digest("hex")
    this.PasswordResetExpires = Date.now() + 30 * 60 * 1000 // 10 minutes
    return resettoken
}

//Export the model
module.exports = mongoose.model("User", userSchema)

// const rawPassword = "224468Ade"
// const hashedPassword =
//     "$2b$10$RL34/VD3tG5bNTa6hIl8.u1Hg7bEvut7jWc4Bdblr2Lu8lXe4CNpC"

// bcrypt
//     .compare(rawPassword, hashedPassword)
//     .then((isMatch) => {
//         if (isMatch) {
//             console.log("Password matches")
//         } else {
//             console.log("Password does not match")
//         }
//     })
//     .catch((error) => {
//         console.error("Error comparing passwords:", error)
//     })
