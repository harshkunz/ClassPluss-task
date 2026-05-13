import express from "express";
import {
  getTemplate,
  getTemplateImage,
  listCategories,
  listTemplates,
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/categories", listCategories);
router.get("/", listTemplates);
router.get("/:id/image", getTemplateImage);
router.get("/:id", getTemplate);

export default router;
