import express from "express";
import { billingStatus, checkout, listPlans } from "../controllers/billingController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/plans", listPlans);
router.get("/status", requireAuth, billingStatus);
router.post("/checkout", requireAuth, checkout);

export default router;
