const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending"
        }
    },
    { timestamps: true }
);

connectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model("Connection", connectionSchema);
