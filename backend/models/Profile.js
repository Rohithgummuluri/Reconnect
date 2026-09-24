const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
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
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
