import Link from "next/link";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import type { CartItemResponse } from "@/types";
import { CartSelectableContent } from "./CartSelectableContent";

export function CartPage({ items, isAuthenticated }: { items: CartItemResponse[]; isAuthenticated: boolean }) {
  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 lg:py-20">
        <h1 className="text-2xl font-semibold tracking-[-0.24px] text-[#1D2026]">
          Shopping Cart <span className="font-normal">({items.length})</span>
        </h1>

        {!isAuthenticated ? (
          <div className="mt-6 border border-[#E9EAF0] bg-[#F8F8FF] p-8 text-center">
            <h2 className="text-xl font-semibold text-[#1D2026]">Sign in to view your cart</h2>
            <p className="mt-2 text-sm text-[#6E7485]">Your saved courses and checkout summary will appear after you sign in.</p>
            <Link href="/login" className="mt-5 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold text-white">
              Sign In
            </Link>
          </div>
        ) : (
          <CartSelectableContent items={items} />
        )}
      </section>
      <CoursesFooter />
    </main>
  );
}
