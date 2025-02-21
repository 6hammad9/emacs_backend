import mongoose from "mongoose";

const daysColorsSchema = new mongoose.Schema({
  day_name: String,
  color: String,
});

export default mongoose.model("DaysColors", daysColorsSchema);
