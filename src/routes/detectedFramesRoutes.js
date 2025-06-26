import express from "express";
import DetectedFrames from "../models/DetectedFrames.js";
import CameraInfo from "../models/CameraInfo.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { cam, filepath, findings, person, seen } = req.body;

    // Ensure cam is a string
    const camId = cam.toString();

    // Fetch the camera info and populate related fields
    const camInfo = await CameraInfo.findOne({ cam_id: camId })
      .populate("department")
      .populate("department_area");

    if (!camInfo) {
      return res.status(404).json({ error: `Camera with ID ${camId} not found` });
    }

    const newEntry = new DetectedFrames({
      cam: camId,
      filepath,
      findings,
      person,
      seen,
      department: camInfo.department?._id || null,
      department_area: camInfo.department_area?._id || null,
    });

    await newEntry.save();
    res.status(201).json({ message: "Detection saved successfully" });
  } catch (error) {
    console.error("Failed to save detection:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
