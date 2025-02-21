import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  dep_name: String,
  datetime: { type: Date, default: Date.now },
});

export default mongoose.model("Department", departmentSchema);
