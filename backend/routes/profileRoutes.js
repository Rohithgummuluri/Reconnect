const express = require("express");
const Profile = require("../models/Profile");

const router = express.Router();

// CREATE PROFILE
router.post("/", async (req, res) => {
    try {
        const {
            fullName,
            schoolName,
            batchYear,
            villageName,
            mobileNumber
        } = req.body;

        if (
            !fullName ||
            !schoolName ||
            !batchYear ||
            !villageName ||
            !mobileNumber
        ) {
            return res.status(400).json({
                message: "Please fill all required details."
            });
        }

        const profile = await Profile.create({
            fullName: fullName.trim(),
            schoolName: schoolName.trim(),
            batchYear: String(batchYear).trim(),
            villageName: villageName.trim(),
            mobileNumber: mobileNumber.trim()
        });

        res.status(201).json({
            message: "Profile created successfully.",
            profile
        });

    } catch (error) {
        console.error("Create profile error:", error);

        res.status(500).json({
            message: "Could not create profile."
        });
    }
});


// GET PROFILE
router.get("/:profileId", async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.profileId)
            .select("-__v");

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        res.json({ profile });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Could not load profile."
        });
    }
});


// EDIT / UPDATE PROFILE
router.patch("/:profileId", async (req, res) => {
    try {
        const {
            fullName,
            schoolName,
            batchYear,
            villageName,
            mobileNumber
        } = req.body;

        if (
            !fullName ||
            !schoolName ||
            !batchYear ||
            !villageName ||
            !mobileNumber
        ) {
            return res.status(400).json({
                message: "Please fill all required details."
            });
        }

        const updatedProfile = await Profile.findByIdAndUpdate(
            req.params.profileId,
            {
                fullName: fullName.trim(),
                schoolName: schoolName.trim(),
                batchYear: String(batchYear).trim(),
                villageName: villageName.trim(),
                mobileNumber: mobileNumber.trim()
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-__v");

        if (!updatedProfile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        res.json({
            message: "Profile updated successfully.",
            profile: updatedProfile
        });

    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            message: "Could not update profile."
        });
    }
});


module.exports = router;