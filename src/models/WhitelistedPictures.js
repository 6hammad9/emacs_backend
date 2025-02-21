import mongoose from "mongoose";

const whitelistedPicturesSchema = new mongoose.Schema({
  person: { type: mongoose.Schema.Types.ObjectId, ref: "PersonInfo" },
  filepath: String,
});

export default mongoose.model("WhitelistedPictures", whitelistedPicturesSchema);
