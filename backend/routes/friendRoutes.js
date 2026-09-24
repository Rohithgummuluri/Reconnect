const express = require("express");
const Profile = require("../models/Profile");
const Connection = require("../models/Connection");
const Notification = require("../models/Notification");

const router = express.Router();

function normalize(value = "") {
    return String(value).trim().toLowerCase();
}

function calculateMatch(profile, search) {
    let score = 0;
    let fields = 0;

    if (search.school) {
        fields++;

        if (
            normalize(profile.schoolName).includes(
                normalize(search.school)
            )
        ) {
            score += 40;
        }
    }

    if (search.village) {
        fields++;

        if (
            normalize(profile.villageName).includes(
                normalize(search.village)
            )
        ) {
            score += 30;
        }
    }

    if (search.batch) {
        fields++;

        if (
            String(profile.batchYear) ===
            String(search.batch).trim()
        ) {
            score += 30;
        }
    }

    return fields ? Math.round(score) : 0;
};


// =====================================================
// SEARCH FRIENDS
// Phone number is NEVER returned here
// =====================================================

router.get("/search", async (req, res) => {
    try {
        const {
            village = "",
            school = "",
            batch = ""
        } = req.query;

        if (!village && !school && !batch) {
            return res.status(400).json({
                message: "Enter at least one search detail."
            });
        }

        const conditions = [];

        if (village) {
            conditions.push({
                villageName: {
                    $regex: village.trim(),
                    $options: "i"
                }
            });
        }

        if (school) {
            conditions.push({
                schoolName: {
                    $regex: school.trim(),
                    $options: "i"
                }
            });
        }

        if (batch) {
            conditions.push({
                batchYear: String(batch).trim()
            });
        }

        const profiles = await Profile.find({
            $or: conditions
        }).limit(50);

        const results = profiles.map(profile => ({
            _id: profile._id,
            fullName: profile.fullName,
            schoolName: profile.schoolName,
            batchYear: profile.batchYear,
            villageName: profile.villageName,

            // Phone intentionally NOT included

            matchPercentage: calculateMatch(
                profile,
                {
                    village,
                    school,
                    batch
                }
            )
        }));

        results.sort(
            (a, b) =>
                b.matchPercentage -
                a.matchPercentage
        );

        res.json({ results });

    } catch (error) {
        console.error("Search error:", error);

        res.status(500).json({
            message: "Search failed."
        });
    }
});


// =====================================================
// SEND CONNECTION REQUEST
// =====================================================

router.post("/request", async (req, res) => {
    try {
        const {
            senderId,
            receiverId
        } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({
                message:
                    "Sender and receiver are required."
            });
        }

        if (String(senderId) === String(receiverId)) {
            return res.status(400).json({
                message:
                    "You cannot connect with yourself."
            });
        }

        const [
            sender,
            receiver
        ] = await Promise.all([
            Profile.findById(senderId),
            Profile.findById(receiverId)
        ]);

        if (!sender || !receiver) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        const existing = await Connection.findOne({
            sender: senderId,
            receiver: receiverId
        });

        if (existing) {

            if (existing.status === "pending") {
                return res.status(409).json({
                    message:
                        "Connection request already sent."
                });
            }

            if (existing.status === "accepted") {
                return res.status(409).json({
                    message:
                        "You are already connected."
                });
            }
        }

        const reverse = await Connection.findOne({
            sender: receiverId,
            receiver: senderId
        });

        if (reverse) {

            if (reverse.status === "accepted") {
                return res.status(409).json({
                    message:
                        "You are already connected."
                });
            }

            if (reverse.status === "pending") {
                return res.status(409).json({
                    message:
                        "This person has already sent you a connection request."
                });
            }
        }

        const connection =
            await Connection.create({
                sender: senderId,
                receiver: receiverId,
                status: "pending"
            });

        const notification =
            await Notification.create({
                receiver: receiverId,
                sender: senderId,
                type: "connection_request",
                title: "New Connection Request",
                message:
                    `${sender.fullName} wants to reconnect with you.`
            });

        const io = req.app.get("io");

        if (io) {
            io.to(`user:${receiverId}`).emit(
                "notification",
                {
                    _id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    connectionId: connection._id
                }
            );
        }

        res.status(201).json({
            message:
                "Connection request sent.",
            connection
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    "Connection request already exists."
            });
        }

        console.error(
            "Connection request error:",
            error
        );

        res.status(500).json({
            message:
                "Could not send connection request."
        });
    }
});


// =====================================================
// GET PENDING REQUESTS
// Phone number is NOT returned
// =====================================================

router.get(
    "/:profileId/requests",
    async (req, res) => {

        try {

            const requests =
                await Connection.find({
                    receiver:
                        req.params.profileId,
                    status: "pending"
                })
                    .populate(
                        "sender",
                        "fullName schoolName batchYear villageName"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.json({ requests });

        } catch (error) {

            console.error(
                "Load requests error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not load requests."
            });
        }
    }
);


// =====================================================
// REQUEST DETAILS
// Used by View Profile popup
// Phone number NOT shown
// =====================================================

router.get(
    "/request/:connectionId/details",
    async (req, res) => {

        try {

            const connection =
                await Connection.findById(
                    req.params.connectionId
                )
                    .populate(
                        "sender",
                        "fullName schoolName batchYear villageName"
                    )
                    .populate(
                        "receiver",
                        "fullName schoolName batchYear villageName"
                    );

            if (!connection) {
                return res.status(404).json({
                    message:
                        "Connection request not found."
                });
            }

            res.json({
                connection
            });

        } catch (error) {

            console.error(
                "Request details error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not load request details."
            });
        }
    }
);


// =====================================================
// ACCEPT / DECLINE REQUEST
// =====================================================

router.patch(
    "/request/:connectionId",
    async (req, res) => {

        try {

            const {
                status,
                receiverId
            } = req.body;

            if (
                !["accepted", "declined"]
                    .includes(status)
            ) {
                return res.status(400).json({
                    message:
                        "Status must be accepted or declined."
                });
            }

            const connection =
                await Connection.findById(
                    req.params.connectionId
                )
                    .populate(
                        "sender",
                        "fullName"
                    )
                    .populate(
                        "receiver",
                        "fullName"
                    );

            if (!connection) {
                return res.status(404).json({
                    message:
                        "Connection request not found."
                });
            }

            if (
                String(connection.receiver._id) !==
                String(receiverId)
            ) {
                return res.status(403).json({
                    message:
                        "You cannot modify this request."
                });
            }

            if (connection.status !== "pending") {
                return res.status(409).json({
                    message:
                        "This request has already been processed."
                });
            }

            connection.status = status;

            await connection.save();

            const notificationType =
                status === "accepted"
                    ? "connection_accepted"
                    : "connection_declined";

            const title =
                status === "accepted"
                    ? "Connection Accepted"
                    : "Connection Declined";

            const message =
                status === "accepted"
                    ? `${connection.receiver.fullName} accepted your connection request.`
                    : `${connection.receiver.fullName} declined your connection request.`;

            const notification =
                await Notification.create({
                    receiver:
                        connection.sender._id,
                    sender:
                        connection.receiver._id,
                    type:
                        notificationType,
                    title,
                    message
                });

            const io =
                req.app.get("io");

            if (io) {

                io.to(
                    `user:${connection.sender._id}`
                ).emit(
                    "connection-request-updated",
                    {
                        title,
                        message,
                        connectionId:
                            connection._id
                    }
                );
            }

            res.json({
                message:
                    `Connection ${status}.`,
                connection
            });

        } catch (error) {

            console.error(
                "Update connection error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not update connection request."
            });
        }
    }
);


// =====================================================
// GET ACCEPTED CONNECTIONS
//
// IMPORTANT:
// Phone number is returned ONLY when:
// connection.status === "accepted"
// =====================================================

router.get(
    "/:profileId/connections",
    async (req, res) => {

        try {

            const profileId =
                req.params.profileId;

            const connections =
                await Connection.find({
                    status: "accepted",
                    $or: [
                        {
                            sender: profileId
                        },
                        {
                            receiver: profileId
                        }
                    ]
                })
                    .populate(
                        "sender",
                        "fullName schoolName batchYear villageName mobileNumber"
                    )
                    .populate(
                        "receiver",
                        "fullName schoolName batchYear villageName mobileNumber"
                    )
                    .sort({
                        updatedAt: -1
                    });

            const results =
                connections.map(
                    connection => {

                        const other =
                            String(
                                connection.sender._id
                            ) ===
                            String(profileId)
                                ? connection.receiver
                                : connection.sender;

                        return {
                            connectionId:
                                connection._id,

                            profile: {
                                _id: other._id,
                                fullName:
                                    other.fullName,
                                schoolName:
                                    other.schoolName,
                                batchYear:
                                    other.batchYear,
                                villageName:
                                    other.villageName,

                                // Automatically visible
                                // because this connection
                                // is accepted.
                                mobileNumber:
                                    other.mobileNumber
                            }
                        };
                    }
                );

            res.json({
                connections: results
            });

        } catch (error) {

            console.error(
                "Load connections error:",
                error
            );

            res.status(500).json({
                message:
                    "Could not load connections."
            });
        }
    }
);


module.exports = router;