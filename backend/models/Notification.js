const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile"
        },
        type: {
            type: String,
            enum: ["connection_request", "connection_accepted", "connection_declined"],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
