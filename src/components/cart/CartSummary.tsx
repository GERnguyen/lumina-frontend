"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { money } from "@/lib/format";
import { verifyVoucherAction } from "@/services/actions/checkout";

export function CartSummary({
  subtotal,
  disabled,
  selectedItemIds,
  selectedCount,
}: {
  subtotal: number;
  disabled?: boolean;
  selectedItemIds?: string[];
  selectedCount?: number;
}) {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<string | undefined>();
  const total = useMemo(() => Math.max(0, subtotal - discount), [discount, subtotal]);

  async function applyCoupon() {
    const code = couponCode.trim();
    if (!code) return;

    setMessage("");
    setPendingAction("coupon");

    try {
      const res = await verifyVoucherAction(code);
      if (!res.success || !res.data) throw new Error(res.error || "Invalid coupon code.");

      const voucher = res.data;
      if (voucher.minPurchaseAmount && subtotal < voucher.minPurchaseAmount) {
        throw new Error(`This coupon requires at least ${money(voucher.minPurchaseAmount)}.`);
      }

      const nextDiscount = Math.min(voucher.discountAmount || 0, voucher.maxDiscountAmount || voucher.discountAmount || 0, subtotal);
      setDiscount(nextDiscount);
      setAppliedCode(voucher.code || code);
      setMessage("Coupon applied.");
    } catch (error: any) {
      setDiscount(0);
      setAppliedCode("");
      setMessage(error?.message || "Could not apply coupon.");
    } finally {
      setPendingAction(undefined);
    }
  }

  function checkout() {
    const params = new URLSearchParams();
    if (appliedCode) params.set("voucher", appliedCode);
    if (selectedItemIds?.length) params.set("items", selectedItemIds.join(","));
    const query = params.toString();
    router.push(`/checkout${query ? `?${query}` : ""}`);
  }

  return (
    <aside className="w-full lg:w-[312px]">
      <div className="space-y-4">
        {typeof selectedCount === "number" ? (
          <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
            <span className="text-[#6E7485]">Selected Courses</span>
            <strong className="font-medium text-[#1D2026]">{selectedCount}</strong>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
          <span className="text-[#6E7485]">Subtotal</span>
          <strong className="font-medium text-[#1D2026]">{money(subtotal)}</strong>
        </div>
        <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
          <span className="text-[#6E7485]">Coupon Discount</span>
          <strong className="font-medium text-[#1D2026]">{discount ? `-${money(discount)}` : "-"}</strong>
        </div>
        <div className="flex items-center justify-between text-sm tracking-[-0.14px]">
          <span className="text-[#6E7485]">Taxes</span>
          <strong className="font-medium text-[#1D2026]">Included</strong>
        </div>
        <div className="h-px bg-[#E9EAF0]" />
        <div className="flex items-center justify-between text-right text-[#202029]">
          <span className="text-base leading-6">Total:</span>
          <strong className="text-2xl font-semibold tracking-[-0.24px]">{money(total)}</strong>
        </div>
      </div>

      <button
        type="button"
        onClick={checkout}
        disabled={disabled || pendingAction === "checkout"}
        className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-[18px] bg-[#564FFD] px-6 text-lg font-semibold text-white transition hover:bg-[#453FCA] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendingAction === "checkout" ? <Loader2 className="size-5 animate-spin" /> : null}
        Proceed To Checkout
        <ArrowRight className="size-5" />
      </button>

      <div className="my-6 h-px bg-[#E9EAF0]" />

      <div>
        <p className="text-sm font-medium tracking-[-0.14px] text-[#1D2026]">Apply coupon code</p>
        <div className="mt-4 flex h-12 overflow-hidden rounded-[8px] border border-[#E9EAF0] bg-white">
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            className="min-w-0 flex-1 border-0 px-4 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
            placeholder="Coupon code"
          />
          <button
            type="button"
            onClick={() => void applyCoupon()}
            disabled={pendingAction === "coupon" || !couponCode.trim()}
            className="m-1.5 flex items-center justify-center rounded-full bg-[#1D2026] px-4 text-sm font-semibold text-white transition hover:bg-[#2B2F36] disabled:opacity-60"
          >
            {pendingAction === "coupon" ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm leading-6 text-[#6E7485]">{message}</p> : null}
      </div>
    </aside>
  );
}
