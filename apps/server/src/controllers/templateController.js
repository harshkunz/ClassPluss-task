import Template from "../models/Template.js";
import TemplateCategory from "../models/TemplateCategory.js";

function buildImageUrl(req, template) {
  if (template.imageData) {
    return `${req.protocol}://${req.get("host")}/api/templates/${template._id}/image`;
  }
  return template.imageUrl;
}

export async function listCategories(req, res, next) {
  try {
    const categories = await TemplateCategory.find({ isActive: true }).lean();
    res.json({ categories });
  } catch (error) {
    next(error);
  }
}

export async function listTemplates(req, res, next) {
  try {
    const templates = await Template.find({ isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    const result = templates.map((t) => ({
      ...t,
      imageUrl: buildImageUrl(req, t),
    }));

    res.json({ templates: result });
  } catch (error) {
    next(error);
  }
}

export async function getTemplate(req, res, next) {
  try {
    const template = await Template.findById(req.params.id)
      .populate("category", "name slug")
      .lean();

    if (!template) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({
      template: {
        ...template,
        imageUrl: buildImageUrl(req, template),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTemplateImage(req, res, next) {
  try {
    const template = await Template.findById(req.params.id).lean();

    if (!template?.imageData) {
      return res.status(404).json({ message: "Not found" });
    }

    res.set("Content-Type", template.imageContentType || "image/png");
    res.send(Buffer.from(template.imageData));
  } catch (error) {
    next(error);
  }
}
