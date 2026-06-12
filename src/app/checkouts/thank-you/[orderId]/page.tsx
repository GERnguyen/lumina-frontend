import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { getOrderThankYouData } from "@/services/order-service";

type ThankYouPageProps = {
  params: Promise<{ orderId: string }>;
};

export const metadata: Metadata = {
  title: "Payment Result",
  description: "Review your Lumina payment result and continue learning.",
};

export default async function Page({ params }: ThankYouPageProps) {
  const { orderId } = await params;
  const order = await getOrderThankYouData(orderId);
  const isPaid = order?.status === "PAID";

  return (
    <main className="min-h-screen bg-white">
      <CoursesTopNav />
      <section className="mx-auto flex max-w-[760px] flex-col items-center px-5 py-20 text-center sm:px-8">
        <div className={`flex size-16 items-center justify-center rounded-full ${isPaid ? "bg-[#E9F9EC] text-[#23BD33]" : "bg-[#FFF7E8] text-[#F59E0B]"}`}>
          {isPaid ? <CheckCircle2 className="size-9" /> : <Clock3 className="size-9" />}
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.3px] text-[#1D2026]">
          {isPaid ? "Payment completed" : "Payment is processing"}
        </h1>
        <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#6E7485]">
          {isPaid
            ? "Your courses are now available in your learning dashboard."
            : "We have received your payment redirect. Your enrollment will appear after the payment provider confirms the transaction."}
        </p>

        <div className="mt-8 w-full border border-[#E9EAF0] bg-white p-6 text-left">
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[#8C94A3]">Order ID</p>
              <p className="mt-1 break-all font-medium text-[#1D2026]">{order?.id || orderId}</p>
            </div>
            <div>
              <p className="text-[#8C94A3]">Status</p>
              <p className="mt-1 font-medium text-[#1D2026]">{order?.status || "Pending confirmation"}</p>
            </div>
            <div>
              <p className="text-[#8C94A3]">Payment Method</p>
              <p className="mt-1 font-medium text-[#1D2026]">{order?.paymentMethod || "Payment provider"}</p>
            </div>
            <div>
              <p className="text-[#8C94A3]">Total</p>
              <p className="mt-1 font-medium text-[#1D2026]">{order?.totalLabel || "Waiting for order details"}</p>
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
