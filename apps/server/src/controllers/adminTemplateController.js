import fs from "fs";
import path from "path";
import Template from "../models/Template.js";
import TemplateCategory from "../models/TemplateCategory.js";

const uploadDir = path.join(process.cwd(), "uploads", "templates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function isObjectId(value) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export async function createTemplate(req, res, next) {
  try {
    const { title, categoryId, categorySlug } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    let category = null;
    if (categoryId && isObjectId(categoryId)) {
      category = await TemplateCategory.findById(categoryId);
    } else if (categorySlug) {
      category = await TemplateCategory.findOne({
        slug: categorySlug.toLowerCase(),
      });
    }

    if (!category) {
      return res.status(400).json({ message: "Valid category is required" });
    }

    const relativePath = `/uploads/templates/${req.file.filename}`;

    const template = await Template.create({
      title,
      category: category._id,
      imageUrl: relativePath,
      isPremium: false,
    });

    return res.status(201).json({ template });
  } catch (error) {
    return next(error);
  }
}
