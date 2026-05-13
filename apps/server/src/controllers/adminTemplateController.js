import Template from "../models/Template.js";
import TemplateCategory from "../models/TemplateCategory.js";
import SharedImage from "../models/SharedImage.js";

function getAbsoluteUrl(req, relativePath) {
  if (!relativePath) return relativePath;
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }

  const base = process.env.SERVER_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
}

function ensureCustomCategory() {
  return TemplateCategory.findOneAndUpdate(
    { slug: "custom" },
    {
      $setOnInsert: {
        name: "Custom",
        slug: "custom",
        description: "User uploaded templates",
        sortOrder: 999,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );
}

export async function createTemplate(req, res, next) {
  try {
    const { title, categoryId, categorySlug } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Image file is required" });
    }

    let category = null;
    const slug = String(categorySlug || categoryId || "").toLowerCase().trim();

    if (categoryId && /^[0-9a-fA-F]{24}$/.test(categoryId)) {
      category = await TemplateCategory.findById(categoryId);
    } else if (slug) {
      category = await TemplateCategory.findOne({ slug });
    }

    if (!category && slug === "custom") {
      category = await ensureCustomCategory();
    }

    if (!category) {
      return res.status(400).json({ message: "Valid category is required" });
    }

    const template = new Template({
      title,
      category: category._id,
      imageUrl: "pending",
      imageData: req.file.buffer,
      imageContentType: req.file.mimetype,
      isPremium: false,
    });

    template.imageUrl = getAbsoluteUrl(req, `/api/templates/${template._id}/image`);
    await template.save();

    const populated = await Template.findById(template._id)
      .populate("category", "name slug")
      .lean();

    return res.status(201).json({
      template: {
        ...populated,
        imageUrl: getAbsoluteUrl(req, `/api/templates/${template._id}/image`),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTemplate(req, res, next) {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    await SharedImage.deleteMany({ template: template._id });
    await template.deleteOne();

    return res.status(200).json({ deleted: true, templateId: template._id });
  } catch (error) {
    return next(error);
  }
}
