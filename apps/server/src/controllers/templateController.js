import Template from "../models/Template.js";
import TemplateCategory from "../models/TemplateCategory.js";

function isObjectId(value) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export async function listCategories(req, res, next) {
  try {
    const categories = await TemplateCategory.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return res.status(200).json({ categories });
  } catch (error) {
    return next(error);
  }
}

export async function listTemplates(req, res, next) {
  try {
    const { category } = req.query;
    const query = { isActive: true };

    if (category) {
      if (isObjectId(category)) {
        query.category = category;
      } else {
        const categoryDoc = await TemplateCategory.findOne({
          slug: category.toLowerCase(),
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

    return res.status(200).json({ templates });
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

    return res.status(200).json({ template });
  } catch (error) {
    return next(error);
  }
}
