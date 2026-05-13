import mongoose from "mongoose";

const overlayPositionSchema = new mongoose.Schema(
  {
    x: { type: Number, default: 0.5 },
    y: { type: Number, default: 0.5 },
  },
  { _id: false }
);

const overlayDefaultsSchema = new mongoose.Schema(
  {
    showName: { type: Boolean, default: true },
    showPhoto: { type: Boolean, default: true },
    namePosition: { type: overlayPositionSchema, default: () => ({}) },
    photoPosition: { type: overlayPositionSchema, default: () => ({}) },
    nameColor: { type: String, default: "#ffffff" },
    nameFontSize: { type: Number, default: 32 },
    photoShape: { type: String, default: "circle" },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TemplateCategory",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imageData: {
      type: Buffer,
    },
    imageContentType: {
      type: String,
      trim: true,
    },
    overlayDefaults: {
      type: overlayDefaultsSchema,
      default: () => ({}),
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumTier: {
      type: String,
      enum: ["gold", "pro", "enterprise"],
      default: "pro",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Template = mongoose.model("Template", templateSchema);

export default Template;
