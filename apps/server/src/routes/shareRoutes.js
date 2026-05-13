import express from "express";
import {
  getShare,
  getShareImage,
  renderShareImage,
} from "../controllers/shareController.js";

const router = express.Router();

router.post("/render", renderShareImage);
router.get("/:shareId/image", getShareImage);
router.get("/:shareId", getShare);

export default router;
