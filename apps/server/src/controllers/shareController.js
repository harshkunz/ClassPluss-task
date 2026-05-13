import crypto from "crypto";
import sharp from "sharp";
import SharedImage from "../models/SharedImage.js";
import Template from "../models/Template.js";
import { loadImageBuffer } from "../utils/imageLoader.js";

function textSvg(text, size, color, w, h) {
  const safe = String(text || "").replace(/[<>]/g, "");
  return Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        style="font-size:${size}px; fill:${color}; font-weight:700; font-family:Arial">
        ${safe}
      </text>
    </svg>
  `);
}

export async function renderShareImage(req, res, next) {
  try {
    const { templateId, name, photoUrl } = req.body;

    const template = await Template.findById(templateId).lean();
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const imageBuffer = template.imageData
      ? Buffer.from(template.imageData)
      : await loadImageBuffer(template.imageUrl);

    const base = sharp(imageBuffer);
    const meta = await base.metadata();
    const w = meta.width || 1080;
    const h = meta.height || 1080;
    const overlay = template.overlayDefaults || {};
    const layers = [];

    if (overlay.showPhoto !== false && photoUrl) {
      const photo = await loadImageBuffer(photoUrl);
      const size = Math.round(Math.min(w, h) * 0.28);
      const x = Math.round((overlay.photoPosition?.x || 0.5) * w - size / 2);
      const y = Math.round((overlay.photoPosition?.y || 0.5) * h - size / 2);

      const resized = await sharp(photo).resize(size, size).png().toBuffer();
      layers.push({ input: resized, left: x, top: y });
    }

    if (overlay.showName !== false && name) {
      const fontSize = overlay.nameFontSize || 36;
      const nameW = Math.round(w * 0.6);
      const nameH = Math.round(fontSize * 1.8);
      const nameX = Math.round((overlay.namePosition?.x || 0.5) * w - nameW / 2);
      const nameY = Math.round((overlay.namePosition?.y || 0.5) * h - nameH / 2);

      layers.push({
        input: textSvg(name, fontSize, overlay.nameColor || "#fff", nameW, nameH),
        left: nameX,
        top: nameY,
      });
    }

    const output = await base.composite(layers).png().toBuffer();
    const shareId = crypto.randomUUID();

    await SharedImage.create({
      shareId,
      template: template._id,
      userName: name || null,
      userPhotoUrl: photoUrl || null,
      outputData: output,
      outputContentType: "image/png",
      outputUrl: `/api/share/${shareId}/image`,
    });

    const host = `${req.protocol}://${req.get("host")}`;
    res.status(201).json({
      shareId,
      imageUrl: `${host}/api/share/${shareId}/image`,
    });
  } catch (error) {
    next(error);
  }
}

export async function getShare(req, res, next) {
  try {
    const share = await SharedImage.findOne({ shareId: req.params.shareId })
      .populate("template", "title")
      .lean();

    if (!share) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ share });
  } catch (error) {
    next(error);
  }
}

export async function getShareImage(req, res, next) {
  try {
    const share = await SharedImage.findOne({ shareId: req.params.shareId }).lean();

    if (!share) {
      return res.status(404).json({ message: "Not found" });
    }

    res.set("Content-Type", share.outputContentType || "image/png");
    res.send(Buffer.from(share.outputData));
  } catch (error) {
    next(error);
  }
}
