import Template from "../models/Template.js";
import TemplateCategory from "../models/TemplateCategory.js";
import SharedImage from "../models/SharedImage.js";

export async function createTemplate(req, res, next) {
  try {
    const { title } = req.body;
    if (!title || !req.file?.buffer) {
      return res.status(400).json({ message: "Title and image required" });
    }

    let category = await TemplateCategory.findOne({ slug: "custom" });
    if (!category) {
      category = await TemplateCategory.create({
        name: "Custom",
        slug: "custom",
      });
    }

    const template = new Template({
      title,
      category: category._id,
      imageUrl: "pending",
      imageData: req.file.buffer,
      imageContentType: req.file.mimetype,
      isPremium: false,
    });

    template.imageUrl = `${req.protocol}://${req.get("host")}/api/templates/${template._id}/image`;
    await template.save();

    const data = await Template.findById(template._id)
      .populate("category", "name slug")
      .lean();

    res.status(201).json({
      template: {
        ...data,
        imageUrl: `${req.protocol}://${req.get("host")}/api/templates/${template._id}/image`,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTemplate(req, res, next) {
  try {
    const t = await Template.findById(req.params.id);
    if (!t) return res.status(404).json({ message: "Not found" });

    await SharedImage.deleteMany({ template: t._id });
    await t.deleteOne();

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
}
