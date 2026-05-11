import express from "express";
import multer from "multer";
import path from "path";
import { createTemplate } from "../controllers/adminTemplateController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads", "templates"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".png");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/templates", upload.single("image"), createTemplate);

export default router;
