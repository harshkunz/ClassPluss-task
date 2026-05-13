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
    outputData: {
      type: Buffer,
      required: true,
    },
    outputContentType: {
      type: String,
      default: "image/png",
    },
    outputUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const SharedImage = mongoose.model("SharedImage", sharedImageSchema);

export default SharedImage;
