import express from "express";
import {
  listPlans,
  getSubscriptionStatus,
  createCheckoutSession,
} from "../controllers/billingController.js";

const router = express.Router();

router.get("/plans", listPlans);
router.get("/status", getSubscriptionStatus);
router.post("/checkout", createCheckoutSession);

export default router;
