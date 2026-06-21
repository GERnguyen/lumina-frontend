import Link from "next/link";
import { redirect } from "next/navigation";

type PaymentReturnHandlerProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  defaultProvider?: string;
};

function getParam(params: Record<string, string | string[] | undefined>, keys: string[]) {
  for (const key of keys) {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    if (value) return value;
  }
  return undefined;
}

export async function PaymentReturnHandler({
  searchParams,
  defaultProvider = "payment",
}: PaymentReturnHandlerProps) {
  const params = (await searchParams) || {};
  const orderId = getParam(params, ["orderId", "order_id", "metadata_order_id", "order"]);
  const provider = getParam(params, ["paymentMethod", "provider", "method"]) || defaultProvider;
  const status = getParam(params, ["status", "resultCode", "code", "redirect_status", "payment_status"]);
  const message = getParam(params, ["message", "error", "error_description"]);

  if (orderId) {
    const query = new URLSearchParams({ provider });
    if (status) query.set("status", status);
    if (message) query.set("message", message);
    redirect(`/checkouts/thank-you/${encodeURIComponent(orderId)}?${query.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-5 py-16">
      <section className="mx-auto max-w-xl rounded-[18px] bg-white p-8 text-center shadow-[0_18px_48px_rgba(29,32,38,0.08)]">
        <p className="text-sm font-semibold uppercase text-[#7872FD]">Payment redirect</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1D2026]">We received the payment redirect.</h1>
        <p className="mt-3 text-sm leading-6 text-[#6E7485]">
          Lumina could not find an order id in the redirect URL. Please open your purchase history to check the latest payment status.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/user-profile/purchase-history" className="inline-flex h-11 items-center justify-center rounded-[16px] bg-[#564FFD] px-5 text-sm font-semibold text-white transition hover:bg-[#453FCA]">
            View purchase history
          </Link>
          <Link href="/courses" className="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#E9EAF0] px-5 text-sm font-semibold text-[#4E5566] transition hover:border-[#D8D6FF] hover:text-[#564FFD]">
            Browse courses
          </Link>
        </div>
      </section>
    </main>
  );
}
