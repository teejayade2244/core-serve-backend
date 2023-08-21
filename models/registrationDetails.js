const mongoose = require("mongoose")

// Declare the Schema of the Mongo model
var userRegistration = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,

            index: true,
            description: "name of the person",
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
        country: {
            type: String,
            required: true,
            description: "The country of the person",
        },
        address: {
            type: String,
            required: true,
            description: "The address of the person",
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
    },
    {
        timestamps: true,
    }
)

//Export the model
module.exports = mongoose.model("UserReg", userRegistration)
