"use client";

import { useState } from "react";
import type { CheckoutPageData } from "@/services/checkout-service";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutPaymentPanel, type PaymentMethod } from "./CheckoutPaymentPanel";

export function CheckoutContent({ checkout }: { checkout: CheckoutPageData }) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("VN_PAY");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = !checkout.authenticated || !checkout.items.length;

  async function completePayment() {
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/course-actions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          cartItemIds: checkout.items.map((item) => item.id),
          ...(checkout.voucher?.discount ? { voucherCode: checkout.voucher.code } : {}),
        }),
      });
      const payload = (await response.json()) as { paymentUrl?: string; data?: string; message?: string };
      if (!response.ok) {
        throw new Error(
          payload.message ||
            (selectedMethod === "MOMO"
              ? "MoMo did not return a payment URL. Please check the backend MoMo credentials, return URL, notify URL, and request type."
              : "Could not start checkout."),
        );
      }

      const paymentUrl = payload.paymentUrl || payload.data;
      if (paymentUrl) {
        window.location.assign(paymentUrl);
        return;
      }

      setMessage(
        selectedMethod === "MOMO"
          ? "MoMo did not return a payment URL. Please check the backend MoMo configuration."
          : "Order created, but the payment provider did not return a redirect URL.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete payment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start">
      <CheckoutPaymentPanel selectedMethod={selectedMethod} onSelectedMethodChange={setSelectedMethod} />
      <CheckoutOrderSummary
        checkout={checkout}
        disabled={isDisabled}
        isSubmitting={isSubmitting}
        message={message}
        onCompletePayment={() => void completePayment()}
      />
    </div>
  );
}
