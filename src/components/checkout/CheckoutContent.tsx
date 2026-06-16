"use client";

import { useState } from "react";
import type { CartItemResponse, VoucherResponse } from "@/types";
import { createOrderAction } from "@/services/actions/checkout";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutPaymentPanel, type PaymentMethod } from "./CheckoutPaymentPanel";

type CheckoutContentProps = {
  items: CartItemResponse[];
  voucher?: VoucherResponse;
  voucherError?: string;
  voucherCode?: string;
};

export function CheckoutContent({
  items,
  voucher,
  voucherError,
  voucherCode,
}: CheckoutContentProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("VN_PAY");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function completePayment() {
    setMessage("");
    setIsSubmitting(true);

    try {
      const res = await createOrderAction({
        paymentMethod: selectedMethod,
        cartItemIds: items.map((item) => item.id).filter((id): id is string => Boolean(id)),
        voucherCode: voucherCode?.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(
          res.error ||
          (selectedMethod === "MOMO"
            ? "MoMo did not return a payment URL. Please check the backend MoMo credentials, return URL, notify URL, and request type."
            : "Could not start checkout."),
        );
      }

      if (res.paymentUrl) {
        window.location.assign(res.paymentUrl);
        return;
      }

      setMessage(
        selectedMethod === "MOMO"
          ? "MoMo did not return a payment URL. Please check the backend MoMo configuration."
          : "Order created, but the payment provider did not return a redirect URL.",
      );
    } catch (error: any) {
      setMessage(error?.message || "Could not complete payment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start">
      <CheckoutPaymentPanel selectedMethod={selectedMethod} onSelectedMethodChange={setSelectedMethod} />
      <CheckoutOrderSummary
        items={items}
        voucher={voucher}
        voucherError={voucherError}
        voucherCode={voucherCode}
        isSubmitting={isSubmitting}
        message={message}
        onCompletePayment={() => void completePayment()}
      />
    </div>
  );
}
