import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { OrderApi } from "@/services/api/enrollment-api";
import { money, paymentMethodLabel } from "@/lib/format";

type ThankYouPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Payment Result",
  description: "Review your Cinx payment result and continue learning.",
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function isProviderSuccess(provider: string, status?: string) {
  if (!status) return false;
  const normalizedProvider = provider.toUpperCase();
  const normalizedStatus = status.toLowerCase();
  if (normalizedProvider === "MOMO") return status === "0" || normalizedStatus === "success" || normalizedStatus === "successful.";
  if (normalizedProvider === "STRIPE") return normalizedStatus === "success" || normalizedStatus === "succeeded" || normalizedStatus === "complete";
  return normalizedStatus === "success" || normalizedStatus === "succeeded" || status === "0";
}

function isProviderCancelled(status?: string) {
  if (!status) return false;
  const normalizedStatus = status.toLowerCase();
  return normalizedStatus === "cancel" || normalizedStatus === "cancelled" || normalizedStatus === "canceled" || normalizedStatus === "failed";
}

export default async function Page({ params, searchParams }: ThankYouPageProps) {
  const { orderId } = await params;
  const query = (await searchParams) || {};
  const provider = getParam(query, "provider") || "Payment";
  const status = getParam(query, "status");
  const providerSucceeded = isProviderSuccess(provider, status);
  const providerCancelled = isProviderCancelled(status);
  const orderRes = await OrderApi.getOrderById(orderId).catch(() => ({ data: undefined }));
  const order = orderRes.data;

  const isPaid = order?.status === "PAID" || providerSucceeded;
  const isFailed = !isPaid && providerCancelled;
  const total = Math.max(0, (order?.totalPrice || 0) - (order?.discounted || 0));
  const totalLabel = money(total);

  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <section className="mx-auto flex max-w-[760px] flex-col items-center px-5 py-20 text-center sm:px-8">
        <div
          className={`flex size-16 items-center justify-center rounded-full ${isPaid ? "bg-[#E9F9EC] text-[#23BD33]" : isFailed ? "bg-[#FFF0F0] text-[#EF4444]" : "bg-[#FFF7E8] text-[#F59E0B]"
            }`}
        >
          {isPaid ? <CheckCircle2 className="size-9" /> : isFailed ? <XCircle className="size-9" /> : <Clock3 className="size-9" />}
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.3px] text-[#1D2026]">
          {isPaid ? "Payment completed" : isFailed ? "Payment was cancelled" : "Payment is processing"}
        </h1>
        <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#6E7485]">
          {isPaid
            ? "Your courses are now available in your learning dashboard."
            : isFailed
              ? "The payment provider returned without completing the payment. You can retry checkout whenever you are ready."
              : "We have received your payment redirect. Your enrollment will appear after the payment provider confirms the transaction."}
        </p>

        <div className="mt-8 w-full rounded-[18px] border border-[#E9EAF0] bg-white p-6 text-left">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[#8C94A3]">Order ID</p>
              <p className="mt-1 break-all font-medium text-[#1D2026]">{order?.id || orderId}</p>
            </div>
            <div>
              <p className="text-[#8C94A3]">Status</p>
              <p className="mt-1 font-medium text-[#1D2026]">{order?.status || (isPaid ? "PAID" : isFailed ? "Cancelled" : "Pending confirmation")}</p>
            </div>
            <div>
              <p className="text-[#8C94A3]">Payment Method</p>
              <p className="mt-1 font-medium text-[#1D2026]">{paymentMethodLabel(order?.paymentMethod) || provider}</p>
            </div>
            <div>
              <p className="text-[#8C94A3]">Total</p>
              <p className="mt-1 font-medium text-[#1D2026]">{totalLabel}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/user-profile/courses" className="inline-flex h-12 items-center justify-center rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold text-white transition hover:bg-[#453FCA]">
            Go to My Courses
          </Link>
          <Link href="/user-profile/purchase-history" className="inline-flex h-12 items-center justify-center rounded-[18px] bg-[#EBEBFF] px-6 text-sm font-semibold text-[#564FFD] transition hover:bg-[#D8D6FF]">
            View Purchase History
          </Link>
        </div>
      </section>
      <CoursesFooter />
    </main>
  );
}
