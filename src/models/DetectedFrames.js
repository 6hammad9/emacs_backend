import mongoose from "mongoose";

const detectedFramesSchema = new mongoose.Schema({
  cam: String,
  filepath: String,
  findings: String,
  person: {
    name: String,
    status: String,
    color: String,
  },
  seen: Number,
  datetime: { type: Date, default: Date.now },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  department_area: { type: mongoose.Schema.Types.ObjectId, ref: "DepartmentArea" },
});

export default mongoose.model("DetectedFrames", detectedFramesSchema);
