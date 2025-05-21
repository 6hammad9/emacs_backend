import mongoose from "mongoose";

const departmentAreaSchema = new mongoose.Schema({
  area_name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  datetime: { type: Date, default: Date.now },
});

export default mongoose.model("DepartmentArea", departmentAreaSchema);
