import express from "express";
import { renderShareImage, getShare } from "../controllers/shareController.js";

const router = express.Router();

router.post("/render", renderShareImage);
router.get("/:shareId", getShare);

export default router;
