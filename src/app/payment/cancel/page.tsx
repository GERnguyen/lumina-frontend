import Link from "next/link";
import { XCircle } from "lucide-react";

type PaymentCancelPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentCancelPage({ searchParams }: PaymentCancelPageProps) {
  const params = (await searchParams) || {};
  const orderId = getParam(params, "orderId") || getParam(params, "order_id");

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-5 py-16">
      <section className="mx-auto max-w-xl rounded-[18px] bg-white p-8 text-center shadow-[0_18px_48px_rgba(29,32,38,0.08)]">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#FFF0F0] text-[#EF4444]">
          <XCircle className="size-9" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase text-[#7872FD]">Payment cancelled</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1D2026]">Your payment was not completed.</h1>
        <p className="mt-3 text-sm leading-6 text-[#6E7485]">
          No enrollment was confirmed for this checkout. You can try again from checkout or review your purchase history.
        </p>
        {orderId ? <p className="mt-4 break-all text-xs text-[#8C94A3]">Order ID: {orderId}</p> : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/checkout" className="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#564FFD] px-5 text-sm font-semibold text-white transition hover:bg-[#453FCA]">
            Back to checkout
          </Link>
          <Link href="/user-profile/purchase-history" className="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#E9EAF0] px-5 text-sm font-semibold text-[#4E5566] transition hover:border-[#D8D6FF] hover:text-[#564FFD]">
            View purchase history
          </Link>
        </div>
      </section>
    </main>
  );
}
