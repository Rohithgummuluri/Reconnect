
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        // Existing profile fields
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        schoolName: {
            type: String,
            required: true,
            trim: true
        },

        batchYear: {
            type: String,
            required: true,
            trim: true
        },

        villageName: {
            type: String,
            required: true,
            trim: true
        },

        mobileNumber: {
            type: String,
            required: true,
            trim: true
        },

        phoneVisibility: {
            type: String,
            enum: ["private", "connections"],
            default: "private"
        },

        // New education fields
        educationCategory: {
            type: String,
            default: "",
            trim: true
        },

        educationLevel: {
            type: String,
            default: "",
            trim: true
        },

        educationYear: {
            type: String,
            default: "",
            trim: true
        },

        // New location field
        districtName: {
            type: String,
            default: "",
            trim: true
        },

        // New Memory Box field
        memoryBox: {
            type: String,
            default: "",
            maxlength: 1500,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Profile", profileSchema);