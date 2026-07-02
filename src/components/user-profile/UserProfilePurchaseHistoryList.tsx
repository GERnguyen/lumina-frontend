"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, CreditCard, DollarSign, PlayCircle, Search, Star } from "lucide-react";
import type { ProfilePurchaseCourse, ProfilePurchaseHistoryItem } from "@/data/user-profile";
import { OrderService } from "@/services/enrollmentService";
import { PaymentService } from "@/services/paymentService";

type PurchaseSort = "latest" | "oldest" | "highest" | "lowest";

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-xs leading-4 text-[#6E7485]">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-[18px] border border-[#E9EAF0] bg-white px-4 pr-10 text-base text-[#4E5566] outline-none transition focus:border-[#564FFD]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#4E5566]" />
      </span>
    </label>
  );
}

function parseMoneyValue(value: string) {
  const numeric = value.replace(/[^\d]/g, "");
  return numeric ? Number(numeric) : 0;
}

function parsePurchaseDate(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function filterPurchases(
  purchases: ProfilePurchaseHistoryItem[],
  filters: { query: string; status: string; paymentMethod: string; sort: PurchaseSort },
) {
  const query = filters.query.trim().toLowerCase();
  let next = purchases.filter((purchase) => {
    if (query) {
      const haystack = [
        purchase.id,
        purchase.purchasedAt,
        purchase.total,
        purchase.paymentMethod,
        purchase.status,
        ...purchase.courses.flatMap((course) => [course.title, course.instructor]),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.status !== "all" && purchase.status !== filters.status) return false;
    if (filters.paymentMethod !== "all" && purchase.paymentMethod !== filters.paymentMethod) return false;
    return true;
  });

  if (filters.sort === "oldest") {
    next = [...next].sort((a, b) => parsePurchaseDate(a.purchasedAt) - parsePurchaseDate(b.purchasedAt));
  } else if (filters.sort === "highest") {
    next = [...next].sort((a, b) => parseMoneyValue(b.total) - parseMoneyValue(a.total));
  } else if (filters.sort === "lowest") {
    next = [...next].sort((a, b) => parseMoneyValue(a.total) - parseMoneyValue(b.total));
  } else {
    next = [...next].sort((a, b) => parsePurchaseDate(b.purchasedAt) - parsePurchaseDate(a.purchasedAt));
  }

  return next;
}

function PurchaseStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  let classes = "bg-[#FFF4E5] text-[#B85C00]"; // default PENDING
  if (normalized === "PAID") {
    classes = "bg-[#E6FBD9] text-[#1E7E34]";
  } else if (normalized === "CANCELLED") {
    classes = "bg-[#FCE8E6] text-[#C5221F]";
  } else if (normalized === "REFUNDED") {
    classes = "bg-[#F1F3F4] text-[#5F6368]";
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold leading-5 tracking-wide ${classes}`}>
      {status}
    </span>
  );
}

function PurchaseMeta({ purchase }: { purchase: ProfilePurchaseHistoryItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm tracking-normal text-[#4E5566]">
      <span className="inline-flex items-center gap-1.5">
        <PlayCircle className="size-4 text-[#564FFD]" />
        {purchase.courseCount} {purchase.courseCount === 1 ? "Course" : "Courses"}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <DollarSign className="size-4 text-[#564FFD]" />
        {purchase.total}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CreditCard className="size-4 text-[#23BD33]" />
        {purchase.paymentMethod}
      </span>
      <PurchaseStatusBadge status={purchase.status} />
    </div>
  );
}

function PurchaseCourseRow({ course }: { course: ProfilePurchaseCourse }) {
  return (
    <article className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_86px] sm:items-center">
      <div className="flex min-w-0 gap-5">
        <div className="relative h-[92px] w-[124px] shrink-0 overflow-hidden rounded-[18px] bg-[#F5F7FA] sm:h-[120px] sm:w-[160px]">
          <Image src={course.image} alt={course.title} fill sizes="160px" className="object-cover" />
        </div>

        <div className="flex min-h-[92px] min-w-0 flex-col justify-between sm:min-h-[120px]">
          <div>
            <div className="flex items-center gap-1.5 text-sm tracking-normal">
              <Star className="size-4 fill-[#FD8E1F] text-[#FD8E1F] sm:size-5" />
              <span className="font-medium text-[#1D2026]">{course.rating}</span>
              <span className="line-clamp-1 text-[#8C94A3]">({course.reviews} Review)</span>
            </div>
            <Link href={`/courses/${course.courseId}`} className="mt-2 line-clamp-2 block max-w-[360px] text-base font-medium leading-[22px] text-[#1D2026] transition hover:text-[#564FFD]">
              {course.title}
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5 text-sm leading-[22px] tracking-normal">
            <span className="text-[#A1A5B3]">Course by:</span>
            <span className="text-[#4E5566]">{course.instructor}</span>
          </div>
        </div>
      </div>

      <strong className="text-xl font-medium leading-[26px] text-[#564FFD] sm:text-right">{course.price}</strong>
    </article>
  );
}

function ExpandedPurchaseContent({ purchase }: { purchase: ProfilePurchaseHistoryItem }) {
  const [isActionPending, setIsActionPending] = useState(false);
  const [error, setError] = useState<string>();
  const [selectedMethod, setSelectedMethod] = useState<"MOMO" | "STRIPE">("MOMO");
  const [showMethodSelect, setShowMethodSelect] = useState(false);

  async function handleCancelOrder() {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setIsActionPending(true);
    setError(undefined);
    try {
      const res = await OrderService.cancelOrder({ orderId: purchase.id });
      if (res.success) {
        window.location.reload();
      } else {
        setError(res.message || "Failed to cancel order");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while cancelling the order");
    } finally {
      setIsActionPending(false);
    }
  }

  async function handlePay() {
    if (!purchase.paymentId) {
      setError("No payment session associated with this order.");
      return;
    }
    setIsActionPending(true);
    setError(undefined);
    try {
      const res = await PaymentService.createCheckoutLink({
        paymentId: purchase.paymentId,
        paymentMethod: selectedMethod,
      });
      if (res.success && res.data) {
        window.location.href = res.data;
      } else {
        setError(res.message || "Failed to generate checkout link");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while initiating payment");
    } finally {
      setIsActionPending(false);
    }
  }

  return (
    <div className="grid border-t border-[#E9EAF0] lg:grid-cols-[minmax(0,1fr)_458px]">
      <div className="space-y-6 p-4 sm:p-6">
        {purchase.courses.length ? (
          purchase.courses.map((course) => <PurchaseCourseRow key={course.id} course={course} />)
        ) : (
          <div className="rounded-[18px] border border-dashed border-[#D8D6FF] bg-[#F9F9FF] p-6 text-sm text-[#6E7485]">
            Course details will appear here when the order API includes line items.
          </div>
        )}
      </div>

      <aside className="border-t border-[#E9EAF0] p-4 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
        <div>
          <p className="text-2xl leading-8 tracking-normal text-[#1D2026]">{purchase.summaryDate}</p>
          <div className="mt-3">
            <PurchaseMeta purchase={purchase} />
          </div>
        </div>

        <div className="mt-8 text-sm tracking-normal text-[#1D2026]">
          <span>Purchased by: <strong>{purchase.paymentName}</strong></span>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-danger-50 p-3 text-xs font-semibold text-danger-600 border border-danger-200">
            {error}
          </div>
        )}

        {purchase.status === "PENDING" && (
          <div className="mt-8 border-t border-[#E9EAF0] pt-6 space-y-4">
            {showMethodSelect ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#6E7485]">Select Payment Method:</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#1D2026] cursor-pointer">
                    <input
                      type="radio"
                      name={`payment-method-${purchase.id}`}
                      value="MOMO"
                      checked={selectedMethod === "MOMO"}
                      onChange={() => setSelectedMethod("MOMO")}
                      className="text-[#564FFD] focus:ring-[#564FFD]"
                    />
                    MoMo
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-[#1D2026] cursor-pointer">
                    <input
                      type="radio"
                      name={`payment-method-${purchase.id}`}
                      value="STRIPE"
                      checked={selectedMethod === "STRIPE"}
                      onChange={() => setSelectedMethod("STRIPE")}
                      className="text-[#564FFD] focus:ring-[#564FFD]"
                    />
                    Stripe
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMethodSelect(false)}
                    disabled={isActionPending}
                    className="flex h-9 flex-1 items-center justify-center rounded-xl border border-[#E9EAF0] text-xs font-semibold text-[#4E5566] transition hover:bg-[#F5F7FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={isActionPending}
                    className="flex h-9 flex-1 items-center justify-center rounded-xl bg-[#564FFD] text-xs font-semibold text-white transition hover:bg-[#433BDB]"
                  >
                    {isActionPending ? "Loading..." : "Pay Now"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowMethodSelect(true)}
                  disabled={isActionPending}
                  className="flex h-10 w-full items-center justify-center rounded-[14px] bg-[#564FFD] text-sm font-semibold text-white transition hover:bg-[#433BDB] active:scale-[0.98] disabled:opacity-50"
                >
                  Pay/Change Payment
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isActionPending}
                  className="flex h-10 w-full items-center justify-center rounded-[14px] border border-danger-200 text-sm font-semibold text-danger-600 transition hover:bg-danger-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {isActionPending ? "Loading..." : "Cancel Order"}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function PurchaseHistoryItem({ purchase, defaultOpen }: { purchase: ProfilePurchaseHistoryItem; defaultOpen?: boolean }) {
  return (
    <details className="group overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white transition duration-300 open:shadow-[0_6px_16px_rgba(0,0,0,0.06)]" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 transition hover:bg-[#F8F9FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#564FFD] sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-lg leading-6 tracking-normal text-[#1D2026] transition group-open:text-[#564FFD]">{purchase.purchasedAt}</p>
          <div className="mt-3">
            <PurchaseMeta purchase={purchase} />
          </div>
        </div>

        <span className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-[#F5F7FA] text-[#1D2026] transition duration-300 group-open:bg-[#564FFD] group-open:text-white group-hover:scale-105">
          <ChevronDown className="size-6 transition duration-300 group-open:rotate-180" />
        </span>
      </summary>

      <ExpandedPurchaseContent purchase={purchase} />
    </details>
  );
}

export function UserProfilePurchaseHistoryList({ purchases }: { purchases: ProfilePurchaseHistoryItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [sort, setSort] = useState<PurchaseSort>("latest");

  const paymentOptions = useMemo(() => {
    const methods = Array.from(new Set(purchases.map((purchase) => purchase.paymentMethod).filter(Boolean)));
    return [{ label: "All methods", value: "all" }, ...methods.map((method) => ({ label: method, value: method }))];
  }, [purchases]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(purchases.map((purchase) => purchase.status).filter(Boolean)));
    return [{ label: "All statuses", value: "all" }, ...statuses.map((item) => ({ label: item, value: item }))];
  }, [purchases]);

  const filteredPurchases = useMemo(
    () => filterPurchases(purchases, { query, status, paymentMethod, sort }),
    [paymentMethod, purchases, query, sort, status],
  );

  return (
    <div>
      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(280px,528px)_repeat(3,minmax(180px,240px))]">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-xs leading-4 text-[#6E7485]">Search:</span>
          <span className="flex h-12 items-center gap-3 rounded-[18px] border border-[#E9EAF0] bg-white px-4 transition focus-within:border-[#564FFD]">
            <Search className="size-6 text-[#8C94A3]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
              placeholder="Search orders or courses..."
            />
          </span>
        </label>
        <SelectField
          label="Sort by:"
          value={sort}
          onChange={(value) => setSort(value as PurchaseSort)}
          options={[
            { label: "Latest", value: "latest" },
            { label: "Oldest", value: "oldest" },
            { label: "Highest total", value: "highest" },
            { label: "Lowest total", value: "lowest" },
          ]}
        />
        <SelectField label="Status:" value={status} onChange={setStatus} options={statusOptions} />
        <SelectField label="Payment:" value={paymentMethod} onChange={setPaymentMethod} options={paymentOptions} />
      </div>

      <div className="space-y-4">
        {filteredPurchases.map((purchase, index) => (
          <PurchaseHistoryItem key={purchase.id} purchase={purchase} defaultOpen={index === 0} />
        ))}
      </div>

      {!filteredPurchases.length ? (
        <div className="rounded-[18px] border border-dashed border-[#D8D6FF] bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#1D2026]">No purchases match your filters.</p>
          <p className="mt-2 text-sm text-[#6E7485]">Try another keyword, status, or payment method.</p>
        </div>
      ) : null}
    </div>
  );
}
