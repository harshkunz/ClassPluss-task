import express from "express";
import {
  listCategories,
  listTemplates,
  getTemplate,
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/categories", listCategories);
router.get("/", listTemplates);
router.get("/:id", getTemplate);

export default router;
