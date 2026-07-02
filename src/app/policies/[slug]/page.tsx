import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPoliciesAction, getPublishedPolicyBySlugAction } from "@/services/actions/policy";
import { CoursesTopNav } from "@/components/courses/CoursesTopNav";
import { CoursesFooter } from "@/components/courses/CoursesFooter";
import { Markdown } from "@/components/recommendations/MarkdownRenderer";
import { Shield, FileText, Calendar, BookOpen, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPublishedPolicyBySlugAction(slug);
  const policy = res.data;

  return {
    title: policy ? `${policy.title} - Cinx Policies` : "Điều khoản & Chính sách - Cinx",
    description: policy?.summary || "Các văn bản điều khoản thỏa thuận và chính sách bảo mật của hệ thống Cinx.",
  };
}

export default async function PolicyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Parallel fetch policies list & active policy detail
  const [listRes, activeRes] = await Promise.all([
    getPublishedPoliciesAction(),
    getPublishedPolicyBySlugAction(slug),
  ]);

  const policiesList = (listRes.data || []).filter((p) => p.status === "PUBLISHED" && p.slug);
  const policy = activeRes.data;

  if (!policy || policy.status !== "PUBLISHED") {
    notFound();
  }

  const formatDate = (val?: string) => {
    if (!val) return "--";
    try {
      return new Date(val).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFD] flex flex-col justify-between">
      <div>
        <CoursesTopNav />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header section with gradient backdrop */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#564FFD]/5 via-[#7872FD]/3 to-[#FAFAFD] border border-[#E9EAF0] p-8 md:p-12 mb-10">
            <div className="relative z-10 space-y-3.5 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/50 border border-primary-200 px-3 py-1 text-xs font-bold text-primary-700">
                <Shield className="size-3.5" />
                Cinx Legal Center
              </span>
              <h1 className="text-3xl font-black text-zinc-950 tracking-tight leading-tight md:text-4xl">
                {policy.title}
              </h1>
              {policy.summary && (
                <p className="text-sm font-medium text-zinc-550 leading-relaxed">
                  {policy.summary}
                </p>
              )}
            </div>
            {/* Background decorative circles */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 size-64 rounded-full bg-primary-200/10 blur-3xl pointer-events-none" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* Left sidebar: navigation menu */}
            <aside className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
              <div className="rounded-[24px] border border-[#E9EAF0] bg-white p-5 shadow-2xs">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-4 px-2">
                  Danh sách chính sách
                </p>
                <nav className="space-y-1.5">
                  {policiesList.map((item) => {
                    const isActive = item.slug === slug;
                    return (
                      <Link
                        key={item.id}
                        href={`/policies/${item.slug}`}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${isActive
                            ? "bg-primary-50 text-[#564FFD] border border-primary-200/50 shadow-2xs"
                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent"
                          }`}
                      >
                        <FileText className={`size-4 shrink-0 ${isActive ? "text-[#564FFD]" : "text-zinc-400"}`} />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Table of contents jump links (if there are multiple headings in sections) */}
              {policy.sections && policy.sections.length > 0 && (
                <div className="rounded-[24px] border border-[#E9EAF0] bg-white p-5 shadow-2xs">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-4 px-2">
                    Mục lục bài viết
                  </p>
                  <nav className="space-y-2">
                    {[...policy.sections]
                      .sort((a, b) => {
                        const orderA = a.orderIndex ?? 0;
                        const orderB = b.orderIndex ?? 0;
                        if (orderA !== orderB) return orderA - orderB;
                        return a.id && b.id ? a.id.localeCompare(b.id) : 0;
                      })
                      .map((section, idx) => {
                        const anchor = section.anchor || `section-${idx}`;
                        return (
                          <a
                            key={section.id || idx}
                            href={`#${anchor}`}
                            className="block text-xs font-semibold text-zinc-500 hover:text-[#564FFD] transition-colors leading-relaxed px-2 hover:underline"
                          >
                            {section.heading || `Phần ${idx + 1}`}
                          </a>
                        );
                      })}
                  </nav>
                </div>
              )}
            </aside>

            {/* Right side: Active policy details and sections */}
            <article className="lg:col-span-8 space-y-6">
              {/* Metadata panel */}
              <div className="rounded-[24px] border border-[#E9EAF0] bg-white p-6 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-zinc-500 font-general">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4.5 text-zinc-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Ngày hiệu lực</span>
                    <span className="text-zinc-800">{formatDate(policy.effectiveAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-zinc-100 sm:border-l sm:pl-6">
                  <Clock className="size-4.5 text-zinc-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Cập nhật lúc</span>
                    <span className="text-zinc-800">{formatDate(policy.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-zinc-100 sm:border-l sm:pl-6">
                  <BookOpen className="size-4.5 text-zinc-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Phiên bản</span>
                    <span className="text-zinc-800">Version {policy.versionNumber || "1.0"}</span>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="rounded-[24px] border border-[#E9EAF0] bg-white p-8 md:p-10 shadow-2xs space-y-8">
                {policy.sections && policy.sections.length > 0 ? (
                  [...policy.sections]
                    .sort((a, b) => {
                      const orderA = a.orderIndex ?? 0;
                      const orderB = b.orderIndex ?? 0;
                      if (orderA !== orderB) return orderA - orderB;
                      return a.id && b.id ? a.id.localeCompare(b.id) : 0;
                    })
                    .map((section, idx) => {
                      const anchor = section.anchor || `section-${idx}`;
                      return (
                        <section key={section.id || idx} id={anchor} className="space-y-4 scroll-mt-6">
                          {section.heading && (
                            <h2 className="text-lg font-black text-zinc-950 border-b border-zinc-100 pb-2.5 pt-4">
                              {section.heading}
                            </h2>
                          )}
                          {section.bodyMarkdown && (
                            <div className="prose prose-zinc max-w-none text-zinc-700 font-medium">
                              <Markdown text={section.bodyMarkdown} />
                            </div>
                          )}
                        </section>
                      );
                    })
                ) : (
                  <p className="text-sm font-medium italic text-zinc-400 py-6 text-center">
                    Nội dung văn bản chính sách này hiện chưa có mục nào.
                  </p>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>

      <CoursesFooter />
    </main>
  );
}
