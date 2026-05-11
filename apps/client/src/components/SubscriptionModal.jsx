import { useState } from "react";
import { apiRequest } from "../services/api";

export default function SubscriptionModal({ plans, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckout = async (planId) => {
    setIsSubmitting(true);
    setMessage("");

    try {
      const data = await apiRequest("/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planId }),
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setMessage(data.message || "Checkout is not configured yet.");
    } catch (error) {
      setMessage(error.message || "Unable to start checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 text-[#1c1b1f] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff6f59]">
              Premium Access
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Unlock premium templates
            </h2>
            <p className="mt-2 text-sm text-[#6f6c73]">
              Get full access to premium designs, HD exports, and priority
              support.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-black/10 bg-[#f6efe9] p-5"
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-[#6f6c73]">
                {plan.currency} {plan.price} / {plan.interval}
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-[#4c4a50]">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleCheckout(plan.id)}
                className="mt-5 w-full rounded-2xl bg-[#2c5d63] px-4 py-3 text-sm font-semibold text-white disabled:cursor-progress disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : "Upgrade"}
              </button>
            </div>
          ))}
        </div>

        {message && (
          <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
