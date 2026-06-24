"use client";

import { CheckCircle2 } from "lucide-react";

export type PaymentMethod = "MOMO" | "STRIPE";

type CheckoutPaymentPanelProps = {
  selectedMethod: PaymentMethod;
  onSelectedMethodChange: (method: PaymentMethod) => void;
};

const paymentMethods: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
  mark: string;
}> = [
    {
      id: "STRIPE",
      title: "Stripe",
      description: "Pay with cards and supported international payment methods through Stripe Checkout.",
      mark: "S",
    },
    {
      id: "MOMO",
      title: "MoMo",
      description: "You will be redirected to MoMo to review and complete your Cinx order.",
      mark: "M",
    },
  ];

export function CheckoutPaymentPanel({ selectedMethod, onSelectedMethodChange }: CheckoutPaymentPanelProps) {
  return (
    <section className="min-w-0 flex-1">
      <div className="space-y-4">
        <h2 className="text-lg font-medium leading-6 text-[#1D2026]">Payment Method</h2>
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelectedMethodChange(method.id)}
              className={`flex w-full items-center gap-5 border bg-white px-5 py-4 text-left transition hover:border-[#7872FD] hover:bg-[#F8F8FF] ${isSelected ? "border-[#23BD33]" : "border-[#E9EAF0]"
                }`}
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${method.id === "MOMO" ? "bg-[#A50064] text-white" : "bg-[#635BFF] text-white"}`}>
                {method.mark}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#1D2026]">{method.title}</span>
                <span className="mt-1 block text-xs leading-5 text-[#8C94A3]">{method.description}</span>
              </span>
              <CheckCircle2 className={`size-6 shrink-0 ${isSelected ? "fill-[#23BD33] text-white" : "text-[#E9EAF0]"}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
