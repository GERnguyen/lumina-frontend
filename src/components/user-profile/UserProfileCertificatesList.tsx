"use client";

import { useEffect, useState } from "react";
import { CertificateApi } from "@/services/api/learning-api";
import type { CertificateRequestResponse } from "@/types";
import type { ProfileCourseItem } from "@/data/user-profile";
import { formatShortDate } from "@/lib/format";
import { Award, Calendar, ExternalLink, Loader2 } from "lucide-react";

interface UserProfileCertificatesListProps {
  courses: ProfileCourseItem[];
}

type CertificateRequestWithRelations = CertificateRequestResponse & {
  course?: {
    title?: string | null;
  } | null;
};

export function UserProfileCertificatesList({ courses }: UserProfileCertificatesListProps) {
  const [certificates, setCertificates] = useState<CertificateRequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        setLoading(true);
        setError(null);
        const res = await CertificateApi.getMyCertificates();
        if (res?.data) {
          setCertificates(res.data);
        }
      } catch (err: any) {
        console.error("Failed to load certificates:", err);
        setError("Có lỗi xảy ra khi tải danh sách chứng chỉ.");
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#564FFD]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[18px] border border-red-100 bg-red-50 p-6 text-center">
        <p className="text-base font-semibold text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-[18px] bg-red-100 px-4 text-sm font-semibold text-red-800 hover:bg-red-200 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#D8D6FF] bg-white px-6 py-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#EBEBFF] text-[#564FFD]">
          <Award className="size-8" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-[#1D2026]">Chưa có chứng chỉ nào</h3>
        <p className="mt-2 text-sm text-[#6E7485] max-w-md mx-auto">
          Hoàn thành các khóa học trên Cinx và đạt yêu cầu để nhận chứng chỉ chính thức.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026] flex items-center gap-3">
        Certificates <span className="font-normal text-lg">({certificates.length})</span>
      </h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((cert) => {
          // Resolve course title
          const courseTitle = cert.course?.title ||
            courses.find(c => c.id === cert.courseId)?.title ||
            `Khóa học ID: ${cert.courseId?.substring(0, 8)}...`;

          const status = cert.status || "PENDING";
          const isApproved = status === "APPROVED";
          const isRejected = status === "REJECTED";

          let badgeBg = "bg-[#FFF4E5] text-[#B85C00]"; // PENDING
          let badgeText = "Chờ duyệt";
          if (isApproved) {
            badgeBg = "bg-[#E6FBD9] text-[#1E7E34]";
            badgeText = "Đã cấp";
          } else if (isRejected) {
            badgeBg = "bg-[#FCE8E6] text-[#C5221F]";
            badgeText = "Từ chối";
          }

          const displayDate = cert.approvedAt || cert.requestedAt;

          return (
            <article
              key={cert.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(29,32,38,0.08)]"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EBEBFF] text-[#564FFD] group-hover:bg-[#564FFD] group-hover:text-white transition duration-300">
                    <Award className="size-6" />
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                <h3 className="mt-5 line-clamp-2 min-h-12 text-base font-semibold leading-6 text-[#1D2026] group-hover:text-[#564FFD] transition duration-300" title={courseTitle}>
                  {courseTitle}
                </h3>

                {displayDate && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-[#6E7485]">
                    <Calendar className="size-4 shrink-0" />
                    <span>{isApproved ? "Cấp ngày: " : "Yêu cầu ngày: "}{formatShortDate(displayDate)}</span>
                  </div>
                )}
              </div>

              {isApproved && cert.certificateUrl && (
                <div className="mt-6 border-t border-[#E9EAF0] pt-4">
                  <a
                    href={cert.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full h-10 items-center justify-center gap-2 rounded-[18px] bg-[#EBEBFF] text-[#564FFD] hover:bg-[#564FFD] hover:text-white text-sm font-semibold tracking-normal transition duration-300"
                  >
                    <span>Xem chứng chỉ</span>
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
