"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { CartPageData } from "@/services/cart-service";
import { CartActions } from "./CartActions";
import { CartSummary } from "./CartSummary";

export function CartSelectableContent({ cart }: { cart: CartPageData }) {
  const [selectedItemIds, setSelectedItemIds] = useState(() => cart.items.map((item) => item.id));
  const selectedItems = useMemo(
    () => cart.items.filter((item) => selectedItemIds.includes(item.id)),
    [cart.items, selectedItemIds],
  );
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price, 0),
    [selectedItems],
  );
  const allSelected = cart.items.length > 0 && selectedItemIds.length === cart.items.length;

  function toggleAll() {
    setSelectedItemIds(allSelected ? [] : cart.items.map((item) => item.id));
  }

  function toggleItem(itemId: string) {
    setSelectedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 border border-[#E9EAF0] bg-white">
        <div className="hidden h-[54px] grid-cols-[52px_1fr_180px_180px] items-center border-b border-[#E9EAF0] px-6 text-sm font-medium uppercase text-[#4E5566] lg:grid">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label="Select all cart courses"
              className="size-5 rounded-none border-[#DADDE6] text-[#564FFD] focus:ring-[#564FFD]"
            />
          </label>
          <span>Course</span>
          <span>Prices</span>
          <span>Action</span>
        </div>

        {cart.items.length ? (
          <div className="divide-y divide-[#E9EAF0] px-4 lg:px-6">
            {cart.items.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);

              return (
                <article key={item.id} className="grid gap-5 py-5 lg:grid-cols-[32px_1fr_180px_180px] lg:items-center">
                  <label className="flex items-start pt-1 lg:items-center lg:pt-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.id)}
                      aria-label={`Select ${item.title}`}
                      className="size-5 rounded-none border-[#DADDE6] text-[#564FFD] focus:ring-[#564FFD]"
                    />
                  </label>
                  <div className="flex gap-5">
                    <Link href={`/courses/${item.courseId}`} className="relative h-[100px] w-[134px] shrink-0 overflow-hidden bg-[#F5F7FA] sm:h-[120px] sm:w-[160px]">
                      <Image src={item.image} alt={item.title} fill sizes="160px" className="object-cover transition hover:scale-105" />
                    </Link>
                    <div className="flex min-w-0 flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-sm tracking-[-0.14px]">
                          <Star className="size-5 fill-[#FD8E1F] text-[#FD8E1F]" />
                          <span className="font-medium text-[#1D2026]">{item.rating}</span>
                          {item.reviewLabel ? <span className="text-[#8C94A3]">{item.reviewLabel}</span> : null}
                        </div>
                        <Link href={`/courses/${item.courseId}`} className="mt-2 line-clamp-2 block max-w-[360px] text-base font-medium leading-[22px] text-[#1D2026] transition hover:text-[#564FFD]">
                          {item.title}
                        </Link>
                      </div>
                      <p className="mt-3 text-sm tracking-[-0.14px] text-[#A1A5B3]">
                        Course by: <span className="text-[#4E5566]">{item.instructor}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:block">
                    <span className="text-xl font-medium leading-[26px] text-[#564FFD]">{item.priceLabel}</span>
                    {item.originalPriceLabel ? <span className="text-lg leading-6 tracking-[-0.27px] text-[#8C94A3] line-through lg:ml-1">{item.originalPriceLabel}</span> : null}
                  </div>

                  <CartActions itemId={item.id} courseId={item.courseId} />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-[#1D2026]">Your cart is empty</h2>
            <p className="mt-2 text-sm text-[#6E7485]">Add courses to your cart and they will appear here.</p>
            <Link href="/courses" className="mt-5 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold text-white">
              Browse Courses
            </Link>
          </div>
        )}
      </div>

      <CartSummary
        subtotal={selectedSubtotal}
        disabled={!selectedItemIds.length}
        selectedItemIds={selectedItemIds}
        selectedCount={selectedItemIds.length}
      />
    </div>
  );
}
