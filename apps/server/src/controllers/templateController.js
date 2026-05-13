import Template from "../models/Template.js";
import TemplateCategory from "../models/TemplateCategory.js";

function getAbsoluteUrl(req, relativePath) {
  if (!relativePath) return relativePath;
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }

  const base = process.env.SERVER_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
}

function asImageUrl(req, template) {
  if (template.imageData) {
    return getAbsoluteUrl(req, `/api/templates/${template._id}/image`);
  }

  return getAbsoluteUrl(req, template.imageUrl);
}

export async function listCategories(req, res, next) {
  try {
    const categories = await TemplateCategory.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const counts = await Template.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    return res.status(200).json({
      categories: categories.map((category) => ({
        ...category,
        count: countMap.get(String(category._id)) || 0,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listTemplates(req, res, next) {
  try {
    const { category } = req.query;
    const query = { isActive: true };

    if (category) {
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        query.category = category;
      } else {
        const categoryDoc = await TemplateCategory.findOne({
          slug: String(category).toLowerCase(),
          isActive: true,
        }).lean();

        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    const templates = await Template.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      templates: templates.map((template) => ({
        ...template,
        imageUrl: asImageUrl(req, template),
      })),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTemplate(req, res, next) {
  try {
    const template = await Template.findById(req.params.id)
      .populate("category", "name slug")
      .lean();

    if (!template || !template.isActive) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({
      template: {
        ...template,
        imageUrl: asImageUrl(req, template),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTemplateImage(req, res, next) {
  try {
    const template = await Template.findById(req.params.id).lean();

    if (!template || !template.isActive) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (!template.imageData) {
      return res.status(404).json({ message: "Template image not found" });
    }

    res.set("Content-Type", template.imageContentType || "image/png");
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    return res.status(200).send(Buffer.from(template.imageData));
  } catch (error) {
    return next(error);
  }
}
