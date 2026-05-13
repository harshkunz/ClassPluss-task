import crypto from "crypto";
import sharp from "sharp";
import SharedImage from "../models/SharedImage.js";
import Template from "../models/Template.js";
import { loadImageBuffer } from "../utils/imageLoader.js";

function getAbsoluteUrl(req, relativePath) {
  if (!relativePath) return relativePath;
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }

  const base = process.env.SERVER_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
}

function sanitizeText(value) {
  return String(value || "").replace(/[<>]/g, "");
}

function buildNameSvg(text, fontSize, color, width, height) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .label { fill: ${color}; font-size: ${fontSize}px; font-family: Arial, sans-serif; font-weight: 700; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="label">${sanitizeText(text)}</text>
    </svg>
  `);
}

export async function renderShareImage(req, res, next) {
  try {
    const { templateId, name, photoUrl } = req.body;

    if (!templateId) {
      return res.status(400).json({ message: "templateId is required" });
    }

    const template = await Template.findById(templateId).lean();
    if (!template || !template.isActive) {
      return res.status(404).json({ message: "Template not found" });
    }

    const templateBuffer = template.imageData
      ? Buffer.from(template.imageData)
      : await loadImageBuffer(getAbsoluteUrl(req, template.imageUrl));

    const baseImage = sharp(templateBuffer);
    const metadata = await baseImage.metadata();
    const width = metadata.width || 1080;
    const height = metadata.height || 1080;
    const overlayDefaults = template.overlayDefaults || {};
    const composites = [];

    if (overlayDefaults.showPhoto !== false && photoUrl) {
      const photoBuffer = await loadImageBuffer(photoUrl);
      const photoSize = Math.round(Math.min(width, height) * 0.28);
      const photoLeft = Math.round(((overlayDefaults.photoPosition?.x || 0.5) * width) - photoSize / 2);
      const photoTop = Math.round(((overlayDefaults.photoPosition?.y || 0.5) * height) - photoSize / 2);

      const maskedPhoto = await sharp(photoBuffer)
        .resize(photoSize, photoSize)
        .png()
        .toBuffer();

      composites.push({ input: maskedPhoto, left: photoLeft, top: photoTop });
    }

    if (overlayDefaults.showName !== false && name) {
      const fontSize = overlayDefaults.nameFontSize || 36;
      const nameWidth = Math.round(width * 0.6);
      const nameHeight = Math.round(fontSize * 1.8);
      const nameLeft = Math.round(((overlayDefaults.namePosition?.x || 0.5) * width) - nameWidth / 2);
      const nameTop = Math.round(((overlayDefaults.namePosition?.y || 0.5) * height) - nameHeight / 2);

      composites.push({
        input: buildNameSvg(name, fontSize, overlayDefaults.nameColor || "#ffffff", nameWidth, nameHeight),
        left: nameLeft,
        top: nameTop,
      });
    }

    const outputBuffer = await baseImage.composite(composites).png().toBuffer();
    const shareId = crypto.randomUUID();
    const sharePath = `/api/share/${shareId}/image`;

    await SharedImage.create({
      shareId,
      template: template._id,
      userName: name || null,
      userPhotoUrl: photoUrl || null,
      outputData: outputBuffer,
      outputContentType: "image/png",
      outputUrl: sharePath,
    });

    return res.status(201).json({
      shareId,
      imageUrl: getAbsoluteUrl(req, sharePath),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getShare(req, res, next) {
  try {
    const share = await SharedImage.findOne({ shareId: req.params.shareId })
      .populate("template", "title imageUrl")
      .lean();

    if (!share) {
      return res.status(404).json({ message: "Share not found" });
    }

    return res.status(200).json({ share });
  } catch (error) {
    return next(error);
  }
}

export async function getShareImage(req, res, next) {
  try {
    const share = await SharedImage.findOne({ shareId: req.params.shareId }).lean();

    if (!share) {
      return res.status(404).json({ message: "Share not found" });
    }

    res.set("Content-Type", share.outputContentType || "image/png");
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    return res.status(200).send(Buffer.from(share.outputData));
  } catch (error) {
    return next(error);
  }
}
