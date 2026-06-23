import Link from "next/link";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import type { CartItemResponse, VoucherResponse } from "@/types";
import { CheckoutContent } from "./CheckoutContent";

type CheckoutPageProps = {
  items: CartItemResponse[];
  isAuthenticated: boolean;
  voucher?: VoucherResponse;
  voucherError?: string;
  voucherCode?: string;
};

export function CheckoutPage({
  items,
  isAuthenticated,
  voucher,
  voucherError,
  voucherCode,
}: CheckoutPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <section className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 lg:py-20">
        <div>
          <p className="text-sm font-medium text-[#564FFD]">Checkout</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.24px] text-[#1D2026] md:text-[32px] md:leading-10">
            Complete your Lumina order
          </h1>
          <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#6E7485]">
            Review your courses, choose a supported payment method, and continue to the secure provider page.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="mt-8 border border-[#E9EAF0] bg-[#F8F8FF] p-8 text-center">
            <h2 className="text-xl font-semibold text-[#1D2026]">Sign in to checkout</h2>
            <p className="mt-2 text-sm text-[#6E7485]">Your cart and payment options will appear after you sign in.</p>
            <Link href="/login?returnUrl=%2Fcheckout" className="mt-5 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold text-white">
              Sign In
            </Link>
          </div>
        ) : items.length ? (
          <CheckoutContent
            items={items}
            voucher={voucher}
            voucherError={voucherError}
            voucherCode={voucherCode}
          />
        ) : (
          <div className="mt-8 border border-[#E9EAF0] bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-[#1D2026]">Your cart is empty</h2>
            <p className="mt-2 text-sm text-[#6E7485]">Add courses to your cart before starting checkout.</p>
            <Link href="/courses" className="mt-5 inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold text-white">
              Browse Courses
            </Link>
          </div>
        )}
      </section>
      <CoursesFooter />
    </main>
  );
}
