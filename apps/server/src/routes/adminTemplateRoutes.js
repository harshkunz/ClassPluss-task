import express from "express";
import multer from "multer";
import { createCategory, deleteCategory } from "../controllers/adminCategoryController.js";
import { createTemplate, deleteTemplate } from "../controllers/adminTemplateController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/templates", upload.single("image"), createTemplate);
router.delete("/templates/:id", deleteTemplate);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
