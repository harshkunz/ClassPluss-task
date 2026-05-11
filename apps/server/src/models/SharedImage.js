import mongoose from "mongoose";

const sharedImageSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    userPhotoUrl: {
      type: String,
      trim: true,
    },
    outputPath: {
      type: String,
      required: true,
    },
    outputUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SharedImage = mongoose.model("SharedImage", sharedImageSchema);

export default SharedImage;
