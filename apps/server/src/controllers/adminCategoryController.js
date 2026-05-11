import TemplateCategory from "../models/TemplateCategory.js";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const slug = slugify(name);
    if (!slug) {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const existing = await TemplateCategory.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await TemplateCategory.create({ name, slug });
    return res.status(201).json({ category });
  } catch (error) {
    return next(error);
  }
}
