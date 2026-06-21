"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { addToCartAction, removeFromCartAction } from "@/services/actions/cart";
import { addToWishlistAction, removeFromWishlistAction } from "@/services/actions/wishlist";

type CoursePurchaseActionsProps = {
  courseId: string;
  isAuthenticated?: boolean;
  isEnrolled?: boolean;
  isInCart?: boolean;
  isWishlisted?: boolean;
  cartItemId?: string;
};

export function CoursePurchaseActions({
  courseId,
  isAuthenticated,
  isEnrolled,
  isInCart: initialIsInCart,
  isWishlisted: initialIsWishlisted,
  cartItemId: initialCartItemId,
}: CoursePurchaseActionsProps) {
  const router = useRouter();
  const [isInCart, setIsInCart] = useState(initialIsInCart);
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [cartItemId, setCartItemId] = useState(initialCartItemId);
  const [pendingAction, setPendingAction] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");

  if (!isAuthenticated) {
    return (
      <div className="space-y-3 p-6">
        <Link href="/login" className="flex h-12 w-full items-center justify-center rounded-[18px] bg-[#7872FD] text-sm font-semibold text-white transition hover:bg-[#6C66F3]">
          Sign in to enroll
        </Link>
        <p className="text-center text-xs text-[#8C94A3]">Sign in to add this course to your cart or wishlist.</p>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="space-y-3 p-6">
        <Link href={`/learning/${courseId}`} className="flex h-12 w-full items-center justify-center rounded-[18px] bg-[#7872FD] text-sm font-semibold text-white transition hover:bg-[#6C66F3]">
          Continue Learning
        </Link>
      </div>
    );
  }

  async function toggleCart() {
    setMessage("");
    setPendingAction("cart");

    try {
      if (isInCart && cartItemId) {
        const res = await removeFromCartAction(cartItemId);
        if (!res.success) throw new Error(res.error);
        setIsInCart(false);
        setCartItemId(undefined);
        setMessage("Removed from cart.");
      } else {
        const res = await addToCartAction(courseId);
        if (!res.success) throw new Error(res.error);
        setIsInCart(true);
        if (res.data?.id) setCartItemId(String(res.data.id));
        setMessage("Added to cart.");
      }
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || "Could not update cart. Please try again.");
    } finally {
      setPendingAction(undefined);
    }
  }

  async function toggleWishlist() {
    setMessage("");
    setPendingAction("wishlist");

    try {
      if (isWishlisted) {
        const res = await removeFromWishlistAction(courseId);
        if (!res.success) throw new Error(res.error);
        setIsWishlisted(false);
        setMessage("Removed from wishlist.");
      } else {
        const res = await addToWishlistAction(courseId);
        if (!res.success) throw new Error(res.error);
        setIsWishlisted(true);
        setMessage("Added to wishlist.");
      }
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || "Could not update wishlist. Please try again.");
    } finally {
      setPendingAction(undefined);
    }
  }

  async function buyNow() {
    setMessage("");
    setPendingAction("checkout");

    try {
      if (isInCart && cartItemId) {
        router.push(`/checkout?items=${encodeURIComponent(cartItemId)}`);
        return;
      }

      const res = await addToCartAction(courseId);
      if (!res.success) throw new Error(res.error);

      const nextCartItemId = res.data?.id ? String(res.data.id) : undefined;
      setIsInCart(true);
      if (nextCartItemId) setCartItemId(nextCartItemId);
      router.refresh();
      router.push(`/checkout${nextCartItemId ? `?items=${encodeURIComponent(nextCartItemId)}` : ""}`);
    } catch (error: any) {
      setMessage(error?.message || "Could not prepare checkout.");
    } finally {
      setPendingAction(undefined);
    }
  }

  return (
    <div className="space-y-3 p-6">
      <button
        type="button"
        onClick={() => void toggleCart()}
        disabled={pendingAction === "cart"}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#7872FD] text-sm font-semibold text-white transition hover:bg-[#6C66F3] disabled:opacity-60"
      >
        {pendingAction === "cart" ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
        {isInCart ? "Remove From Cart" : "Add To Cart"}
      </button>
      <button
        type="button"
        onClick={() => void buyNow()}
        disabled={pendingAction === "checkout"}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#EBEBFF] text-sm font-semibold text-[#7872FD] transition hover:bg-[#DEDDFF] disabled:opacity-60"
      >
        {pendingAction === "checkout" ? <Loader2 className="size-4 animate-spin" /> : null}
        Buy Now
      </button>
      <button
        type="button"
        onClick={() => void toggleWishlist()}
        disabled={pendingAction === "wishlist"}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-[18px] border border-[#E9EAF0] text-xs font-semibold text-[#4E5566] transition hover:border-[#7872FD] hover:text-[#7872FD] disabled:opacity-60"
      >
        {pendingAction === "wishlist" ? <Loader2 className="size-4 animate-spin" /> : <Heart className={isWishlisted ? "size-4 fill-[#7872FD] text-[#7872FD]" : "size-4"} />}
        {isWishlisted ? "Remove From Wishlist" : "Add To Wishlist"}
      </button>
      <p className="text-center text-xs text-[#8C94A3]">{message || "Secure checkout is powered by Lumina payment services."}</p>
    </div>
  );
}
