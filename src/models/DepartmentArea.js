import mongoose from "mongoose";

const departmentAreaSchema = new mongoose.Schema({
  area_name: String,
  datetime: { type: Date, default: Date.now },
});

export default mongoose.model("DepartmentArea", departmentAreaSchema);
