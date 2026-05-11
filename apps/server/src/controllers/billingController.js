const PLANS = [
  {
    id: "pro-monthly",
    name: "Pro Monthly",
    price: 199,
    currency: "INR",
    interval: "month",
    features: ["Unlimited premium templates", "HD exports", "Priority support"],
  },
  {
    id: "pro-yearly",
    name: "Pro Yearly",
    price: 1999,
    currency: "INR",
    interval: "year",
    features: ["Unlimited premium templates", "HD exports", "Priority support"],
  },
];

export async function listPlans(req, res) {
  return res.status(200).json({ plans: PLANS });
}

export async function getSubscriptionStatus(req, res) {
  return res.status(200).json({
    isPremium: false,
    plan: null,
  });
}

export async function createCheckoutSession(req, res) {
  const { planId } = req.body || {};
  const plan = PLANS.find((item) => item.id === planId);

  if (!plan) {
    return res.status(400).json({ message: "Invalid plan" });
  }

  return res.status(200).json({
    checkoutUrl: "",
    message: "Checkout not configured yet",
  });
}
