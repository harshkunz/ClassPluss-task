import { useState } from "react";
import { apiRequest } from "../services/api";

export default function SubscriptionModal({
  plans,
  onClose,
}) {
  const [loading, setLoading] =
    useState(false);

  const [msg, setMsg] =
    useState("");

  async function handleCheckout(
    planId
  ) {
    setLoading(true);
    setMsg("");

    try {
      const data =
        await apiRequest(
          "/api/billing/checkout",
          {
            method: "POST",
            body: JSON.stringify({
              planId,
            }),
          }
        );

      if (data.checkoutUrl) {
        window.location.href =
          data.checkoutUrl;

        return;
      }

      setMsg(
        data.message ||
          "Checkout unavailable."
      );
    } catch (error) {
      setMsg(
        error.message ||
          "Unable to continue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

      <div className="w-full max-w-2xl bg-white rounded-2xl border border-green-100 shadow-lg p-6">

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
              Premium
            </p>

            <h2 className="text-2xl text-black  font-semibold mt-2">
              Upgrade Plan
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Unlock premium templates and features.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 text-black  py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-6">

          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-green-50 border border-green-100 rounded-2xl p-5"
            >
              <h3 className="text-lg text-black font-semibold">
                {plan.name}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {plan.currency}{" "}
                {plan.price} /{" "}
                {plan.interval}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-gray-700">

                {plan.features.map(
                  (feature) => (
                    <li
                      key={feature}
                    >
                      • {feature}
                    </li>
                  )
                )}
              </ul>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  handleCheckout(
                    plan.id
                  )
                }
                className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3 text-sm"
              >
                {loading
                  ? "Processing..."
                  : "Upgrade"}
              </button>
            </div>
          ))}
        </div>

        {msg && (
          <div className="mt-5 bg-green-50 border border-green-100 text-green-700 rounded-2xl px-4 py-3 text-sm">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}