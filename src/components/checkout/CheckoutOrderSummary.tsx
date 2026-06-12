"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { CheckoutPageData } from "@/services/checkout-service";

type CheckoutOrderSummaryProps = {
  checkout: CheckoutPageData;
  disabled?: boolean;
  isSubmitting?: boolean;
  message?: string;
  onCompletePayment: () => void;
};

export function CheckoutOrderSummary({ checkout, disabled, isSubmitting, message, onCompletePayment }: CheckoutOrderSummaryProps) {
  return (
    <aside className="w-full border border-[#E9EAF0] bg-white lg:w-[416px] xl:w-[488px]">
      <div className="p-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-[#1D2026]">
          Courses <span className="font-normal">{String(checkout.items.length).padStart(2, "0")}</span>
        </h2>
        <div className="mt-4 space-y-4">
          {checkout.items.map((item) => (
            <article key={item.id} className="flex gap-3">
              <Link href={`/courses/${item.courseId}`} className="relative h-[75px] w-[100px] shrink-0 overflow-hidden bg-[#F5F7FA]">
                <Image src={item.image} alt={item.title} fill sizes="100px" className="object-cover transition hover:scale-105" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-4 text-[#A1A5B3]">
                  Course by: <span className="text-[#4E5566]">{item.instructor}</span>
                </p>
                <Link href={`/courses/${item.courseId}`} className="mt-1 line-clamp-2 block text-sm leading-[22px] tracking-[-0.14px] text-[#1D2026] transition hover:text-[#564FFD]">
                  {item.title}
                </Link>
                <div className="mt-2 flex items-center gap-1 text-sm tracking-[-0.14px]">
                  <span className="font-medium text-[#564FFD]">{item.priceLabel}</span>
                  {item.originalPriceLabel ? <span className="text-[#A1A5B3] line-through">{item.originalPriceLabel}</span> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#E9EAF0]" />

      <div className="p-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-[#1D2026]">Order Summary</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
            <span className="text-[#6E7485]">Subtotal</span>
            <strong className="font-medium text-[#1D2026]">{checkout.subtotalLabel}</strong>
          </div>
          <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
            <span className="text-[#6E7485]">Coupon Discount</span>
            <strong className="font-medium text-[#1D2026]">{checkout.discountLabel}</strong>
          </div>
          {checkout.voucher?.message ? <p className="text-xs leading-5 text-[#6E7485]">{checkout.voucher.message}</p> : null}
          <div className="h-px bg-[#E9EAF0]" />
          <div className="flex items-center justify-between text-right text-[#202029]">
            <span className="text-base leading-6">Total:</span>
            <strong className="text-2xl font-semibold tracking-[-0.24px]">{checkout.totalLabel}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onCompletePayment}
          disabled={disabled || isSubmitting}
          className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-[18px] bg-[#564FFD] px-8 text-lg font-semibold text-white transition hover:bg-[#453FCA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
          Complete Payment
        </button>
        {message ? <p className="mt-3 text-sm leading-6 text-[#B42318]">{message}</p> : null}
      </div>
    </aside>
  );
}
