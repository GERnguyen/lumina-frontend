import Image from "next/image";
import Link from "next/link";
import { ChevronDown, CreditCard, DollarSign, PlayCircle, Star } from "lucide-react";
import type { ProfilePurchaseCourse, ProfilePurchaseHistoryItem } from "@/data/user-profile";

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
      {purchase.status !== "PAID" ? (
        <span className="rounded-full bg-[#FFF4E5] px-2.5 py-1 text-xs font-semibold text-[#B85C00]">{purchase.status}</span>
      ) : null}
    </div>
  );
}

function PurchaseCourseRow({ course }: { course: ProfilePurchaseCourse }) {
  return (
    <article className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_86px] sm:items-center">
      <div className="flex min-w-0 gap-5">
        <div className="relative h-[92px] w-[124px] shrink-0 overflow-hidden bg-[#F5F7FA] sm:h-[120px] sm:w-[160px]">
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
  return (
    <div className="grid border-t border-[#E9EAF0] lg:grid-cols-[minmax(0,1fr)_458px]">
      <div className="space-y-6 p-4 sm:p-6">
        {purchase.courses.length ? (
          purchase.courses.map((course) => <PurchaseCourseRow key={course.id} course={course} />)
        ) : (
          <div className="border border-dashed border-[#D8D6FF] bg-[#F9F9FF] p-6 text-sm text-[#6E7485]">
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

        <div className="mt-8 grid gap-4 text-sm tracking-normal text-[#1D2026] sm:grid-cols-[120px_minmax(0,1fr)_80px] sm:items-center">
          <span>{purchase.paymentName}</span>
          <span className="text-lg leading-6 tracking-normal">{purchase.paymentAccount}</span>
          {purchase.paymentExpiry ? <span className="sm:text-right">{purchase.paymentExpiry}</span> : null}
        </div>
      </aside>
    </div>
  );
}

function PurchaseHistoryItem({ purchase, defaultOpen }: { purchase: ProfilePurchaseHistoryItem; defaultOpen?: boolean }) {
  return (
    <details className="group border border-[#E9EAF0] bg-white transition duration-300 open:shadow-[0_6px_16px_rgba(0,0,0,0.06)]" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 transition hover:bg-[#F8F9FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#564FFD] sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="text-lg leading-6 tracking-normal text-[#1D2026] transition group-open:text-[#564FFD]">{purchase.purchasedAt}</p>
          <div className="mt-3">
            <PurchaseMeta purchase={purchase} />
          </div>
        </div>

        <span className="flex size-12 shrink-0 items-center justify-center bg-[#F5F7FA] text-[#1D2026] transition duration-300 group-open:bg-[#564FFD] group-open:text-white group-hover:scale-105">
          <ChevronDown className="size-6 transition duration-300 group-open:rotate-180" />
        </span>
      </summary>

      <ExpandedPurchaseContent purchase={purchase} />
    </details>
  );
}

export function UserProfilePurchaseHistoryList({ purchases }: { purchases: ProfilePurchaseHistoryItem[] }) {
  return (
    <div className="space-y-4">
      {purchases.map((purchase, index) => (
        <PurchaseHistoryItem key={purchase.id} purchase={purchase} defaultOpen={index === 0} />
      ))}
    </div>
  );
}
