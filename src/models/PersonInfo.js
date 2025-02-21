import mongoose from "mongoose";

const personInfoSchema = new mongoose.Schema({
  name: String,
  cam_id: String,
  status: String,
  color: String,
  read_status: Number,
  datetime: { type: Date, default: Date.now },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

export default mongoose.model("PersonInfo", personInfoSchema);
