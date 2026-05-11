const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");

const SharedImage = require("../models/SharedImage");
const Template = require("../models/Template");
const asyncHandler = require("../utils/asyncHandler");
const { loadImageBuffer } = require("../utils/imageLoader");

function getAbsoluteUrl(req, relativePath) {
  const base = process.env.SERVER_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}${relativePath}`;
}

function buildNameSvg(text, fontSize, color, width, height) {
  const safeText = String(text || "").replace(/[<>]/g, "");
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .label { fill: ${color}; font-size: ${fontSize}px; font-family: Arial, sans-serif; font-weight: 600; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="label">${safeText}</text>
    </svg>`
  );
}

const renderShareImage = asyncHandler(async (req, res) => {
  const { templateId, name, photoUrl } = req.body;

  if (!templateId) {
    return res.status(400).json({ message: "templateId is required" });
  }

  const template = await Template.findById(templateId).lean();
  if (!template || !template.isActive) {
    return res.status(404).json({ message: "Template not found" });
  }

  const templateBuffer = await loadImageBuffer(template.imageUrl);
  const baseImage = sharp(templateBuffer);
  const metadata = await baseImage.metadata();

  const width = metadata.width || 1080;
  const height = metadata.height || 1080;

  const overlayDefaults = template.overlayDefaults || {};
  const composites = [];

  if (overlayDefaults.showPhoto && photoUrl) {
    const photoBuffer = await loadImageBuffer(photoUrl);
    const photoSize = Math.min(width, height) * 0.28;
    const photoLeft = Math.round((overlayDefaults.photoPosition?.x || 0.5) * width - photoSize / 2);
    const photoTop = Math.round((overlayDefaults.photoPosition?.y || 0.5) * height - photoSize / 2);

    const circleSvg = Buffer.from(
      `<svg width="${photoSize}" height="${photoSize}">
        <circle cx="${photoSize / 2}" cy="${photoSize / 2}" r="${photoSize / 2}" fill="white" />
      </svg>`
    );

    const maskedPhoto = await sharp(photoBuffer)
      .resize(Math.round(photoSize), Math.round(photoSize))
      .composite([{ input: circleSvg, blend: "dest-in" }])
      .png()
      .toBuffer();

    composites.push({ input: maskedPhoto, left: photoLeft, top: photoTop });
  }

  if (overlayDefaults.showName && name) {
    const fontSize = overlayDefaults.nameFontSize || 36;
    const nameWidth = Math.round(width * 0.6);
    const nameHeight = Math.round(fontSize * 1.8);
    const nameLeft = Math.round((overlayDefaults.namePosition?.x || 0.5) * width - nameWidth / 2);
    const nameTop = Math.round((overlayDefaults.namePosition?.y || 0.5) * height - nameHeight / 2);

    const nameSvg = buildNameSvg(
      name,
      fontSize,
      overlayDefaults.nameColor || "#ffffff",
      nameWidth,
      nameHeight
    );

    composites.push({ input: nameSvg, left: nameLeft, top: nameTop });
  }

  const outputBuffer = await baseImage.composite(composites).png().toBuffer();

  const shareId = crypto.randomUUID();
  const fileName = `${shareId}.png`;
  const outputPath = path.join("uploads", "shared", fileName);
  const absolutePath = path.join(process.cwd(), outputPath);

  await sharp(outputBuffer).toFile(absolutePath);

  const outputUrl = getAbsoluteUrl(req, `/${outputPath.replace(/\\/g, "/")}`);

  const sharedImage = await SharedImage.create({
    shareId,
    template: template._id,
    userName: name || null,
    userPhotoUrl: photoUrl || null,
    outputPath,
    outputUrl,
  });

  return res.status(201).json({
    shareId: sharedImage.shareId,
    imageUrl: sharedImage.outputUrl,
  });
});

const getShare = asyncHandler(async (req, res) => {
  const sharedImage = await SharedImage.findOne({ shareId: req.params.shareId })
    .populate("template", "title imageUrl")
    .lean();

  if (!sharedImage) {
    return res.status(404).json({ message: "Share not found" });
  }

  return res.status(200).json({ share: sharedImage });
});

module.exports = { renderShareImage, getShare };
