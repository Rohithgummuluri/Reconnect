
const express = require("express");
const Profile = require("../models/Profile");

const router = express.Router();

// Helper: convert optional values into trimmed strings
function cleanOptional(value) {
    return typeof value === "string" ? value.trim() : "";
}

// CREATE PROFILE
router.post("/", async (req, res) => {
    try {
        const {
            fullName,
            schoolName,
            batchYear,
            villageName,
            mobileNumber,
            phoneVisibility,
            educationCategory,
            educationLevel,
            educationYear,
            districtName,
            memoryBox
        } = req.body;

        // Existing required fields
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

        // Validate Memory Box length
        if (
            typeof memoryBox === "string" &&
            memoryBox.length > 1500
        ) {
            return res.status(400).json({
                message: "Memory Box cannot exceed 1500 characters."
            });
        }

        const profile = await Profile.create({
            fullName: fullName.trim(),
            schoolName: schoolName.trim(),
            batchYear: String(batchYear).trim(),
            villageName: villageName.trim(),
            mobileNumber: mobileNumber.trim(),

            phoneVisibility:
                phoneVisibility === "connections"
                    ? "connections"
                    : "private",

            educationCategory: cleanOptional(educationCategory),
            educationLevel: cleanOptional(educationLevel),
            educationYear: cleanOptional(educationYear),
            districtName: cleanOptional(districtName),
            memoryBox: cleanOptional(memoryBox)
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
            mobileNumber,
            phoneVisibility,
            educationCategory,
            educationLevel,
            educationYear,
            districtName,
            memoryBox
        } = req.body;

        // Existing required fields
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

        // Validate Memory Box length
        if (
            typeof memoryBox === "string" &&
            memoryBox.length > 1500
        ) {
            return res.status(400).json({
                message: "Memory Box cannot exceed 1500 characters."
            });
        }

        const updateData = {
            fullName: fullName.trim(),
            schoolName: schoolName.trim(),
            batchYear: String(batchYear).trim(),
            villageName: villageName.trim(),
            mobileNumber: mobileNumber.trim(),

            educationCategory: cleanOptional(educationCategory),
            educationLevel: cleanOptional(educationLevel),
            educationYear: cleanOptional(educationYear),
            districtName: cleanOptional(districtName),
            memoryBox: cleanOptional(memoryBox)
        };

        // Update phone visibility only if a valid value is provided
        if (
            phoneVisibility === "private" ||
            phoneVisibility === "connections"
        ) {
            updateData.phoneVisibility = phoneVisibility;
        }

        const updatedProfile = await Profile.findByIdAndUpdate(
            req.params.profileId,
            updateData,
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