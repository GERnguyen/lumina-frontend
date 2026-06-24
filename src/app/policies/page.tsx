import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublishedPoliciesAction } from "@/services/actions/policy";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Policies - Cinx",
  description: "Read Cinx's service agreements, privacy policies, cookie usage, and refund terms.",
};

export default async function PoliciesIndexPage() {
  const res = await getPublishedPoliciesAction();
  const policies = res.data || [];

  // Filter out any published policy draft with valid slugs
  const publishedList = policies.filter((p) => p.status === "PUBLISHED" && p.slug);

  if (publishedList.length > 0) {
    redirect(`/policies/${publishedList[0].slug}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAFD] flex flex-col justify-between">
      <div>
        <CoursesTopNav />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="rounded-[32px] border border-[#E9EAF0] bg-white p-12 shadow-xs">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 mb-6 text-zinc-400">
              <ShieldCheck className="size-8" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 leading-tight">Điều khoản & Chính sách</h1>
            <p className="mt-3 text-sm font-medium text-zinc-500 max-w-md mx-auto leading-relaxed">
              Các văn bản thỏa thuận sử dụng dịch vụ, chính sách bảo mật và hoàn tiền của Cinx hiện chưa được công bố. Vui lòng quay lại sau!
            </p>
          </div>
        </div>
      </div>
      <CoursesFooter />
    </main>
  );
}
