import mongoose from "mongoose";

const cameraInfoSchema = new mongoose.Schema({
  cam_id: String,
  channel: Number,
  read_status: Number,
  camera_name: String,
  color: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  department_area: { type: mongoose.Schema.Types.ObjectId, ref: "DepartmentArea" },
  datetime: { type: Date, default: Date.now },
});

export default mongoose.model("CameraInfo", cameraInfoSchema);
