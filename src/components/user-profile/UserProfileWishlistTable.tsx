"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart, Loader2, Star } from "lucide-react";
import type { ProfileWishlistItem } from "@/data/user-profile";
import { addToCartAction } from "@/services/actions/cart";
import { removeFromWishlistAction } from "@/services/actions/wishlist";
import { cn } from "@/lib/utils";

function WishlistRow({ item }: { item: ProfileWishlistItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<"buy" | "cart" | "remove" | undefined>(undefined);
  const [message, setMessage] = useState("");

  async function handleBuyNow() {
    setMessage("");
    setActiveAction("buy");
    startTransition(async () => {
      try {
        const res = await addToCartAction(item.courseId);
        if (!res.success) throw new Error(res.error);

        const nextCartItemId = res.data?.id ? String(res.data.id) : undefined;
        router.refresh();
        router.push(`/checkout${nextCartItemId ? `?items=${encodeURIComponent(nextCartItemId)}` : ""}`);
      } catch (error: any) {
        setMessage(error?.message || "Could not prepare checkout.");
        setActiveAction(undefined);
      }
    });
  }

  async function handleAddToCart() {
    setMessage("");
    setActiveAction("cart");
    startTransition(async () => {
      try {
        const res = await addToCartAction(item.courseId);
        if (!res.success) throw new Error(res.error);
        setMessage("Added to cart.");
        router.refresh();
      } catch (error: any) {
        setMessage(error?.message || "Failed to add to cart.");
      } finally {
        setActiveAction(undefined);
      }
    });
  }

  async function handleRemove() {
    setMessage("");
    setActiveAction("remove");
    startTransition(async () => {
      try {
        const res = await removeFromWishlistAction(item.courseId);
        if (!res.success) throw new Error(res.error);
        router.refresh();
      } catch (error: any) {
        setMessage(error?.message || "Failed to remove from wishlist.");
        setActiveAction(undefined);
      }
    });
  }

  return (
    <article className="grid gap-5 border-b border-[#E9EAF0] px-4 py-6 last:border-b-0 lg:grid-cols-[minmax(0,600px)_176px_1fr] lg:items-center lg:px-6">
      <div className="flex min-w-0 gap-5">
        <div className="relative h-[120px] w-[160px] shrink-0 overflow-hidden rounded-[18px] bg-[#F5F7FA]">
          <Image src={item.image} alt={item.title} fill sizes="160px" className="object-cover" />
        </div>

        <div className="flex min-h-[120px] min-w-0 flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-sm tracking-normal">
              <Star className="size-5 fill-[#FD8E1F] text-[#FD8E1F]" />
              <span className="font-medium text-[#1D2026]">{item.rating}</span>
              <span className="text-[#8C94A3]">({item.reviews} Review)</span>
            </div>
            <Link href={`/courses/${item.courseId}`} className="mt-2 line-clamp-2 block max-w-[356px] text-base font-medium leading-[22px] text-[#1D2026] transition hover:text-[#564FFD]">
              {item.title}
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5 text-sm leading-[22px] tracking-normal">
            <span className="text-[#A1A5B3]">Course by:</span>
            {item.instructors.map((instructor, index) => (
              <span key={instructor} className="text-[#4E5566]">
                {index > 0 ? "• " : ""}
                {instructor}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-1 lg:block">
        <strong className="text-xl font-medium leading-[26px] text-[#564FFD]">{item.price}</strong>
        {item.originalPrice ? <span className="ml-1 text-lg leading-6 tracking-normal text-[#8C94A3] line-through">{item.originalPrice}</span> : null}
      </div>

      <div className="flex flex-col gap-2 lg:items-end">
        <div className="flex flex-wrap gap-3 lg:justify-end">
          {item.isPurchased ? (
            <Link href={`/learning/${item.courseId}`} className="flex h-12 min-w-[132px] items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-base font-semibold tracking-normal text-white transition hover:bg-[#433EE8]">
              Continue Learning
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isPending}
                className="flex h-12 min-w-[132px] items-center justify-center gap-2 rounded-[18px] bg-[#F5F7FA] px-6 text-base font-semibold tracking-normal text-[#1D2026] transition hover:bg-[#E9EAF0] disabled:opacity-60"
              >
                {activeAction === "buy" ? <Loader2 className="size-4 animate-spin" /> : null}
                Buy Now
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isPending}
                className="flex h-12 min-w-[132px] items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] px-6 text-base font-semibold tracking-normal text-white transition hover:bg-[#433EE8] disabled:opacity-60"
              >
                {activeAction === "cart" ? <Loader2 className="size-4 animate-spin" /> : null}
                Add To Cart
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            aria-label={`Remove ${item.title} from wishlist`}
            className="flex size-12 items-center justify-center rounded-[18px] bg-[#EBEBFF] text-[#564FFD] transition hover:bg-[#DEDDFF] disabled:opacity-60"
          >
            {activeAction === "remove" ? <Loader2 className="size-5 animate-spin" /> : <Heart className="size-6 fill-current" />}
          </button>
        </div>
        {message ? (
          <p className={cn("text-xs font-medium", message.includes("Added") ? "text-[#23BD33]" : "text-[#D92D20]")}>
            {message}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function UserProfileWishlistTable({ items }: { items: ProfileWishlistItem[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white p-8 text-center">
        <p className="text-[#8C94A3] text-base">Your wishlist is empty.</p>
        <Link href="/courses" className="mt-4 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-base font-semibold text-white transition hover:bg-[#433EE8]">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white">
      <div className="hidden border-b border-[#E9EAF0] px-6 py-5 text-sm font-medium uppercase leading-none text-[#4E5566] lg:grid lg:grid-cols-[minmax(0,600px)_176px_1fr]">
        <span>Course</span>
        <span>Prices</span>
        <span>Action</span>
      </div>

      <div>
        {items.map((item) => (
          <WishlistRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
