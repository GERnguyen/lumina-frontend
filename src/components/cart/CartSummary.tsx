"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Ticket } from "lucide-react";
import { money } from "@/lib/format";
import { verifyVoucherAction, getPublishedVouchersAction } from "@/services/actions/checkout";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import type { VoucherResponse } from "@/types";
import { cn } from "@/lib/utils";

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

  // Voucher dialog states
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

  async function openVoucherModal() {
    setIsVoucherModalOpen(true);
    setIsLoadingVouchers(true);
    try {
      const res = await getPublishedVouchersAction();
      if (res.success && res.data) {
        const activeVouchers = (res.data as VoucherResponse[])
          .filter((v) => {
            const now = new Date();
            const fromDate = v.validFrom ? new Date(v.validFrom) : null;
            const toDate = v.validTo ? new Date(v.validTo) : null;
            const isStarted = !fromDate || fromDate <= now;
            const isNotExpired = !toDate || toDate >= now;
            const hasQuantity = v.quantity === undefined || v.quantity > 0;
            return isStarted && isNotExpired && hasQuantity;
          })
          .sort((a, b) => (b.discountAmount || 0) - (a.discountAmount || 0));
        setVouchers(activeVouchers);
      }
    } catch (error) {
      console.error("Failed to load vouchers:", error);
    } finally {
      setIsLoadingVouchers(false);
    }
  }

  async function selectVoucher(code: string) {
    setIsVoucherModalOpen(false);
    setCouponCode(code);

    setMessage("");
    setPendingAction("coupon");
    try {
      const res = await verifyVoucherAction(code);
      if (!res.success || !res.data) throw new Error(res.error || "Mã giảm giá không hợp lệ.");

      const voucher = res.data;
      if (voucher.minPurchaseAmount && subtotal < voucher.minPurchaseAmount) {
        throw new Error(`Mã giảm giá này yêu cầu đơn hàng từ ${money(voucher.minPurchaseAmount)}.`);
      }

      let calculatedDiscount = (subtotal * (voucher.discountAmount || 0)) / 100;
      if (voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, voucher.maxDiscountAmount);
      }
      const nextDiscount = Math.min(calculatedDiscount, subtotal);
      setDiscount(nextDiscount);
      setAppliedCode(voucher.code || code);
      setMessage("Áp dụng mã giảm giá thành công.");
    } catch (error: any) {
      setDiscount(0);
      setAppliedCode("");
      setMessage(error?.message || "Không thể áp dụng mã giảm giá.");
    } finally {
      setPendingAction(undefined);
    }
  }

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

      let calculatedDiscount = (subtotal * (voucher.discountAmount || 0)) / 100;
      if (voucher.maxDiscountAmount && voucher.maxDiscountAmount > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, voucher.maxDiscountAmount);
      }
      const nextDiscount = Math.min(calculatedDiscount, subtotal);
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
    <aside className="w-full rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-[0_14px_34px_rgba(29,32,38,0.06)] lg:w-[312px]">
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
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium tracking-[-0.14px] text-[#1D2026]">Apply coupon code</p>
          <button
            type="button"
            onClick={openVoucherModal}
            className="text-xs font-bold text-[#564FFD] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Ticket className="size-3.5" />
            Chọn voucher
          </button>
        </div>
        <div className="mt-4 flex h-12 overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white">
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
            className="m-1.5 flex items-center justify-center rounded-[14px] bg-[#1D2026] px-4 text-sm font-semibold text-white transition hover:bg-[#2B2F36] disabled:opacity-60"
          >
            {pendingAction === "coupon" ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm leading-6 text-[#6E7485]">{message}</p> : null}
      </div>

      <InstructorDialog
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        title="Chọn Voucher Khuyến Mãi"
        className="max-w-lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {isLoadingVouchers ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="size-6 animate-spin text-[#7872FD]" />
              <span className="text-xs text-gray-400 font-semibold">Đang tải danh sách voucher...</span>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400 font-medium">
              Không có mã giảm giá nào khả dụng vào lúc này.
            </div>
          ) : (
            vouchers.map((voucher) => {
              const code = voucher.code || "";
              const minAmount = voucher.minPurchaseAmount || 0;
              const isEligible = subtotal >= minAmount;
              const discountLabel = voucher.discountAmount ? `${voucher.discountAmount}%` : "";
              const isCurrentlyApplied = appliedCode === code;

              return (
                <div
                  key={voucher.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition text-left",
                    isEligible
                      ? "border-primary-100 bg-[#F8F8FF] hover:border-primary-300"
                      : "border-gray-200 bg-gray-50 opacity-65"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#564FFD]/10 px-2.5 py-1 text-xs font-bold text-[#564FFD]">
                        <Ticket className="size-3.5" />
                        {code}
                      </span>
                      {isEligible && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Khả dụng
                        </span>
                      )}
                    </div>
                    <p className="mt-2.5 text-sm font-bold text-[#1D2026]">
                      Giảm {discountLabel} cho đơn hàng {voucher.maxDiscountAmount ? `(tối đa ${money(voucher.maxDiscountAmount)})` : ""}
                    </p>
                    {minAmount > 0 ? (
                      <p className="mt-1 text-xs text-gray-500 font-medium">
                        Áp dụng cho đơn hàng tối thiểu {money(minAmount)}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500 font-medium">
                        Không yêu cầu giá trị đơn hàng tối thiểu
                      </p>
                    )}
                    {!isEligible && (
                      <p className="mt-2 text-xs font-semibold text-[#EB5757]">
                        Cần mua thêm {money(minAmount - subtotal)} để sử dụng mã này
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center justify-start sm:justify-end">
                    {isEligible ? (
                      <button
                        type="button"
                        onClick={() => selectVoucher(code)}
                        className={cn(
                          "h-10 px-4 rounded-xl text-xs font-bold transition cursor-pointer",
                          isCurrentlyApplied
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-[#1D2026] text-white hover:bg-[#2B2F36]"
                        )}
                      >
                        {isCurrentlyApplied ? "Đã áp dụng" : "Áp dụng"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="h-10 px-4 rounded-xl text-xs font-bold bg-gray-200 text-gray-400 cursor-not-allowed"
                      >
                        Chưa đủ ĐK
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </InstructorDialog>
    </aside>
  );
}
