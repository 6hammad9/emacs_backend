import express from "express";
import DetectedFrames from "../models/DetectedFrames.js";
import Department from "../models/Department.js";
import DepartmentArea from "../models/DepartmentArea.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const results = await DetectedFrames.find({ "person.status": "notwhitelisted" })
      .populate("department", "dep_name") // 👈 populate just the dep_name field
      .populate("department_area", "area_name") // 👈 populate just the area_name
      .sort({ datetime: -1 });

    const formatted = results.map((entry) => ({
      _id: entry._id,
      name: entry.person?.name || "Unknown",
      image: entry.filepath,
      camera: entry.cam || "Unknown Camera",
      department: entry.department?.dep_name || "Unknown Department",
      section: entry.department_area?.area_name || "", // optional
      findings: entry.findings,
      date: entry.datetime,
      time: entry.datetime,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to fetch non-whitelisted data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
