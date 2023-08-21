const nodemailer = require("nodemailer")
const asyncHandler = require("express-async-handler")

const sendEmail = asyncHandler(async (data, req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false, // Disable SSL verification
            },
        })

        const info = await transporter.sendMail({
            from: '"HEY 👻" <tope@gmail.com>',
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        })

        console.log("Message sent: %s", info.messageId)
    } catch (error) {
        console.error("Error sending email:", error)
    }
})

module.exports = { sendEmail }
