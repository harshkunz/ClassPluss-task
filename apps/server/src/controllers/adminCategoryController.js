import TemplateCategory from "../models/TemplateCategory.js";
import Template from "../models/Template.js";

function slug(name) {
  return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    const s = slug(name);
    const exists = await TemplateCategory.findOne({ slug: s });
    if (exists) return res.status(409).json({ message: "Exists" });

    const cat = await TemplateCategory.create({ name, slug: s });
    res.status(201).json({ category: cat });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const cat = await TemplateCategory.findById(id);
    if (!cat) return res.status(404).json({ message: "Not found" });

    await Template.deleteMany({ category: cat._id });
    await cat.deleteOne();

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
}
