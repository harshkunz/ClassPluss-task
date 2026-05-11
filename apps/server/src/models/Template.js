const mongoose = require("mongoose");

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
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    overlayDefaults: {
      type: overlayDefaultsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
