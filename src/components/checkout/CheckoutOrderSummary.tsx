"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { CartItemResponse, VoucherResponse } from "@/types";
import { getCourseImage, getCourseInstructorName, money } from "@/lib/format";

type CheckoutOrderSummaryProps = {
  items: CartItemResponse[];
  voucher?: VoucherResponse;
  voucherError?: string;
  voucherCode?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  message?: string;
  onCompletePayment: () => void;
};

export function CheckoutOrderSummary({
  items,
  voucher,
  voucherError,
  voucherCode,
  disabled,
  isSubmitting,
  message,
  onCompletePayment,
}: CheckoutOrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.course?.discountedPrice ?? item.course?.price ?? 0;
    return sum + price;
  }, 0);

  let discount = 0;
  let voucherMessage = "";

  if (voucher && voucher.code) {
    if (voucher.minPurchaseAmount && subtotal < voucher.minPurchaseAmount) {
      voucherMessage = `This coupon requires at least ${money(voucher.minPurchaseAmount)}.`;
    } else {
      discount = Math.min(
        voucher.discountAmount || 0,
        voucher.maxDiscountAmount || voucher.discountAmount || 0,
        subtotal
      );
      voucherMessage = discount ? "Coupon applied." : "Coupon is available but does not reduce this order.";
    }
  } else if (voucherError) {
    voucherMessage = voucherError;
  }

  const total = Math.max(0, subtotal - discount);

  const subtotalLabel = money(subtotal);
  const discountLabel = discount ? `-${money(discount)}` : "-";
  const totalLabel = money(total);

  return (
    <aside className="w-full border border-[#E9EAF0] bg-white lg:w-[416px] xl:w-[488px]">
      <div className="p-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-[#1D2026]">
          Courses <span className="font-normal">{String(items.length).padStart(2, "0")}</span>
        </h2>
        <div className="mt-4 space-y-4">
          {items.map((item) => {
            const course = item.course!;
            const courseId = course.id!;
            const price = course.discountedPrice ?? course.price ?? 0;
            const originalPrice = course.discountedPrice && course.price && course.discountedPrice < course.price ? course.price : undefined;
            const priceLabel = money(price);
            const originalPriceLabel = originalPrice ? money(originalPrice) : undefined;
            const title = course.title || "Untitled course";
            const instructor = getCourseInstructorName(course);
            const image = getCourseImage(course);

            return (
              <article key={item.id} className="flex gap-3">
                <Link href={`/courses/${courseId}`} className="relative h-[75px] w-[100px] shrink-0 overflow-hidden bg-[#F5F7FA]">
                  <Image src={image} alt={title} fill sizes="100px" className="object-cover transition hover:scale-105" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-4 text-[#A1A5B3]">
                    Course by: <span className="text-[#4E5566]">{instructor}</span>
                  </p>
                  <Link href={`/courses/${courseId}`} className="mt-1 line-clamp-2 block text-sm leading-[22px] tracking-[-0.14px] text-[#1D2026] transition hover:text-[#564FFD]">
                    {title}
                  </Link>
                  <div className="mt-2 flex items-center gap-1 text-sm tracking-[-0.14px]">
                    <span className="font-medium text-[#564FFD]">{priceLabel}</span>
                    {originalPriceLabel ? <span className="text-[#A1A5B3] line-through">{originalPriceLabel}</span> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#E9EAF0]" />

      <div className="p-5 sm:p-6">
        <h2 className="text-lg font-medium leading-6 text-[#1D2026]">Order Summary</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
            <span className="text-[#6E7485]">Subtotal</span>
            <strong className="font-medium text-[#1D2026]">{subtotalLabel}</strong>
          </div>
          <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
            <span className="text-[#6E7485]">Coupon Discount</span>
            <strong className="font-medium text-[#1D2026]">{discountLabel}</strong>
          </div>
          {voucherMessage ? <p className="text-xs leading-5 text-[#6E7485]">{voucherMessage}</p> : null}
          <div className="h-px bg-[#E9EAF0]" />
          <div className="flex items-center justify-between text-right text-[#202029]">
            <span className="text-base leading-6">Total:</span>
            <strong className="text-2xl font-semibold tracking-[-0.24px]">{totalLabel}</strong>
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
