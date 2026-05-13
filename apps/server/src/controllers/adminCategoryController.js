import TemplateCategory from "../models/TemplateCategory.js";
import Template from "../models/Template.js";

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

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const query = /^[0-9a-fA-F]{24}$/.test(id)
      ? { _id: id }
      : { slug: String(id).toLowerCase() };

    const category = await TemplateCategory.findOne(query);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const templates = await Template.find({ category: category._id }).select("_id").lean();
    await Template.deleteMany({ category: category._id });
    await category.deleteOne();

    return res.status(200).json({
      categoryId: category._id,
      templatesDeleted: templates.length,
    });
  } catch (error) {
    return next(error);
  }
}
