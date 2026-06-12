"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";

type CartActionsProps = {
  itemId: string;
  courseId: string;
};

export function CartActions({ itemId, courseId }: CartActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | undefined>();
  const [message, setMessage] = useState("");

  async function removeFromCart() {
    setMessage("");
    setPendingAction("remove");

    try {
      const response = await fetch(`/api/course-actions/cart?itemId=${itemId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not remove this course.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove this course.");
    } finally {
      setPendingAction(undefined);
    }
  }

  async function moveToWishlist() {
    setMessage("");
    setPendingAction("wishlist");

    try {
      const wishlistResponse = await fetch("/api/course-actions/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!wishlistResponse.ok) throw new Error("Could not move this course to wishlist.");

      const removeResponse = await fetch(`/api/course-actions/cart?itemId=${itemId}`, { method: "DELETE" });
      if (!removeResponse.ok) throw new Error("Saved to wishlist, but could not remove from cart.");

      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not move this course.");
    } finally {
      setPendingAction(undefined);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => void moveToWishlist()}
        disabled={Boolean(pendingAction)}
        className="inline-flex h-10 items-center justify-center text-sm font-semibold text-[#564FFD] transition hover:text-[#453FCA] disabled:opacity-60"
      >
        {pendingAction === "wishlist" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Move to Wishlist
      </button>
      <button
        type="button"
        onClick={() => void removeFromCart()}
        disabled={Boolean(pendingAction)}
        className="inline-flex items-center gap-2 text-xs font-medium text-[#8C94A3] transition hover:text-[#D92D20] disabled:opacity-60"
      >
        {pendingAction === "remove" ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
        Remove
      </button>
      {message ? <p className="max-w-[180px] text-xs leading-5 text-[#D92D20]">{message}</p> : null}
    </div>
  );
}
