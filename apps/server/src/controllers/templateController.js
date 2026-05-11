const Template = require("../models/Template");
const TemplateCategory = require("../models/TemplateCategory");
const asyncHandler = require("../utils/asyncHandler");

function isObjectId(value) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

const listCategories = asyncHandler(async (req, res) => {
  const categories = await TemplateCategory.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return res.status(200).json({ categories });
});

const listTemplates = asyncHandler(async (req, res) => {
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
});

const getTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findById(req.params.id)
    .populate("category", "name slug")
    .lean();

  if (!template || !template.isActive) {
    return res.status(404).json({ message: "Template not found" });
  }

  return res.status(200).json({ template });
});

module.exports = {
  listCategories,
  listTemplates,
  getTemplate,
};
