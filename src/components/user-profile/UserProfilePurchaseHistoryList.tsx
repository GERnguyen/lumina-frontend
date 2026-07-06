"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { ChevronDown, CreditCard, DollarSign, Loader2, PlayCircle, Search, Star } from "lucide-react";
import { useConfirmStore } from "@/stores/confirm-store";
import type { ProfilePurchaseCourse, ProfilePurchaseHistoryItem } from "@/data/user-profile";
import { OrderApi } from "@/services/api/enrollment-api";
import { CourseApi } from "@/services/api/course-api";
import { PaymentService } from "@/services/paymentService";
import {
  formatPurchaseDate,
  getCourseImage,
  getCourseInstructorName,
  getCourseRating,
  money,
  moneyWithCurrency,
  paymentMethodLabel,
} from "@/lib/format";

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
      <span className="text-xs bg-[#F5F7FA] border border-[#E9EAF0] px-2 py-0.5 rounded-md font-mono select-all text-zinc-500">
        ID: {purchase.id}
      </span>
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
  const confirm = useConfirmStore((state) => state.confirm);
  const [isActionPending, setIsActionPending] = useState(false);
  const [error, setError] = useState<string>();
  const [selectedMethod, setSelectedMethod] = useState<"MOMO" | "STRIPE">("MOMO");
  const [showMethodSelect, setShowMethodSelect] = useState(false);

  async function handleCancelOrder() {
    const confirmed = await confirm({
      title: "Hủy đơn hàng",
      message: "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
      confirmText: "Hủy đơn hàng",
      cancelText: "Không",
      type: "danger",
    });
    if (!confirmed) return;
    setIsActionPending(true);
    setError(undefined);
    try {
      const res = await OrderApi.cancelOrder(purchase.id);
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
  const [list, setList] = useState<ProfilePurchaseHistoryItem[]>(purchases);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(JSON.stringify({ orderDate: "DESC" }));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(purchases.length >= 10);

  const loaderRef = useRef<HTMLDivElement>(null);

  async function hydrateOrders(orders: any[]) {
    const courseIds = orders.flatMap((o) => o.items || []).map((i) => i.courseId).filter(Boolean) as string[];
    let relatedCourses: any[] = [];
    if (courseIds.length > 0) {
      try {
        const coursesRes = await CourseApi.getCoursesByIds(Array.from(new Set(courseIds)).join(","));
        relatedCourses = coursesRes.data || [];
      } catch (e) {
        console.error("Failed to fetch related courses client-side:", e);
      }
    }

    return orders.map((order, index) => {
      const mappedOrderCourses = (order.items || []).map((item: any, itemIndex: number) => {
        const course = relatedCourses.find((candidate) => candidate.id === item.courseId);
        const price = item.discountedPrice ?? item.price ?? course?.discountedPrice ?? course?.price;

        return {
          id: item.id || `${order.id || "order"}-${item.courseId || itemIndex}`,
          courseId: item.courseId || course?.id || `course-${itemIndex}`,
          title: item.title || course?.title || "Untitled course",
          image: course ? getCourseImage(course, itemIndex) : `/courses/course-0${(itemIndex % 8) + 1}.png`,
          rating: course ? getCourseRating(course.rating) : "No reviews yet",
          reviews: course?.enrollmentCount ? new Intl.NumberFormat("en-US").format(course.enrollmentCount) : "",
          instructor: course ? getCourseInstructorName(course) : "Course Instructor",
          price: typeof price === "number" ? money(price) : "Free",
        };
      });

      const total = Math.max(0, (order.totalPrice || 0) - (order.discounted || 0));

      return {
        id: order.id || `order-${index}-${Date.now()}`,
        purchasedAt: formatPurchaseDate(order.orderDate),
        summaryDate: formatPurchaseDate(order.orderDate),
        courseCount: order.items?.length || 0,
        total: moneyWithCurrency(total),
        paymentMethod: paymentMethodLabel(order.paymentMethod),
        status: order.status || "PENDING",
        paymentName: order.payment?.paymentInfo || "Learner",
        paymentId: order.payment?.id,
        courses: mappedOrderCourses,
      };
    });
  }

  // Reset and fetch first page on filter change
  useEffect(() => {
    let active = true;
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        const res = await OrderApi.getOrders({
          page: 1,
          size: 10,
          query: query || undefined,
          sort: sort || undefined,
        });
        if (!active) return;
        const orders = res.data || [];
        const mapped = await hydrateOrders(orders);
        setList(mapped);
        setPage(1);
        setHasMore(orders.length >= 10);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchFirstPage();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, sort]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await OrderApi.getOrders({
        page: nextPage,
        size: 10,
        query: query || undefined,
        sort: sort || undefined,
      });
      const orders = res.data || [];
      const mapped = await hydrateOrders(orders);
      setList((prev) => [...prev, ...mapped]);
      setPage(nextPage);
      setHasMore(orders.length >= 10);
    } catch (err) {
      console.error("Failed to load more orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, page, query, sort]);

  return (
    <div>
      <div className="mb-6 grid gap-6 sm:grid-cols-[1fr_240px]">
        <label className="flex min-w-0 flex-col gap-2">
          <span className="text-xs leading-4 text-[#6E7485]">Search:</span>
          <span className="flex h-12 items-center gap-3 rounded-[18px] border border-[#E9EAF0] bg-white px-4 transition focus-within:border-[#564FFD]">
            <Search className="size-6 text-[#8C94A3]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-0 p-0 text-base text-[#1D2026] placeholder:text-[#8C94A3] focus:ring-0"
              placeholder="Search orders..."
            />
          </span>
        </label>
        <SelectField
          label="Sort by:"
          value={sort}
          onChange={setSort}
          options={[
            { label: "Latest", value: JSON.stringify({ orderDate: "DESC" }) },
            { label: "Oldest", value: JSON.stringify({ orderDate: "ASC" }) },
            { label: "Highest total", value: JSON.stringify({ totalPrice: "DESC" }) },
            { label: "Lowest total", value: JSON.stringify({ totalPrice: "ASC" }) },
          ]}
        />
      </div>

      <div className="space-y-4">
        {list.map((purchase, index) => (
          <PurchaseHistoryItem key={purchase.id} purchase={purchase} defaultOpen={index === 0} />
        ))}
      </div>

      {/* Infinite Scroll Loader Target */}
      <div ref={loaderRef} className="flex justify-center py-6">
        {loading && <Loader2 className="size-6 animate-spin text-[#564FFD]" />}
      </div>

      {!list.length && !loading ? (
        <div className="rounded-[18px] border border-dashed border-[#D8D6FF] bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#1D2026]">No purchases match your filters.</p>
          <p className="mt-2 text-sm text-[#6E7485]">Try another keyword.</p>
        </div>
      ) : null}
    </div>
  );
}
