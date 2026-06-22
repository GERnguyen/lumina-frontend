"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { removeFromCartAction } from "@/services/actions/cart";
import { addToWishlistAction } from "@/services/actions/wishlist";

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
      const res = await removeFromCartAction(itemId);
      if (!res.success) throw new Error(res.error);
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || "Could not remove this course.");
    } finally {
      setPendingAction(undefined);
    }
  }

  async function moveToWishlist() {
    setMessage("");
    setPendingAction("wishlist");

    try {
      const wishlistRes = await addToWishlistAction(courseId);
      if (!wishlistRes.success) throw new Error(wishlistRes.error);

      const removeRes = await removeFromCartAction(itemId);
      if (!removeRes.success) throw new Error("Saved to wishlist, but could not remove from cart.");

      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || "Could not move this course.");
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
        className="inline-flex h-10 items-center justify-center rounded-[18px] bg-[#EBEBFF] px-4 text-sm font-semibold text-[#564FFD] transition hover:bg-[#DEDDFF] disabled:opacity-60"
      >
        {pendingAction === "wishlist" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Move to Wishlist
      </button>
      <button
        type="button"
        onClick={() => void removeFromCart()}
        disabled={Boolean(pendingAction)}
        className="inline-flex h-9 items-center gap-2 rounded-[18px] px-3 text-xs font-medium text-[#8C94A3] transition hover:bg-[#FFF0F0] hover:text-[#D92D20] disabled:opacity-60"
      >
        {pendingAction === "remove" ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
        Remove
      </button>
      {message ? <p className="max-w-[180px] text-xs leading-5 text-[#D92D20]">{message}</p> : null}
    </div>
  );
}
