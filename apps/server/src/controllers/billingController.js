import User from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    currency: "$",
    price: 0,
    interval: "month",
    features: ["Free templates", "Basic sharing"],
  },
  {
    id: "pro",
    name: "Pro",
    currency: "$",
    price: 9,
    interval: "month",
    features: ["Premium templates", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    currency: "$",
    price: 29,
    interval: "month",
    features: ["All templates", "Team access"],
  },
];

export async function listPlans(req, res) {
  res.json({ plans: PLANS });
}

export async function billingStatus(req, res) {
  const user = req.user;
  res.json({
    isPremium: Boolean(user?.isPremium),
    currentPlan: user?.currentPlan || "free",
  });
}

export async function checkout(req, res, next) {
  try {
    const { planId } = req.body;
    const plan = PLANS.find((p) => p.id === planId);

    if (!plan) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const user = req.user;
    user.isPremium = planId !== "starter";
    user.currentPlan = planId;
    await user.save();

    res.json({
      message: "Plan updated",
      planId,
    });
  } catch (error) {
    next(error);
  }
}
