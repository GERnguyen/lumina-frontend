import { getInstructorCertificateRequests } from "@/services/actions/instructor";
import { InstructorCertificatesClient } from "@/components/instructor/InstructorCertificatesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý chứng chỉ - Giảng viên",
  description: "Phê duyệt và quản lý yêu cầu cấp chứng chỉ của học viên trên Lumina.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;

  // Extract query filters
  const page = Number(firstParam(searchParams.page) || "1");
  const size = Number(firstParam(searchParams.size) || "10");
  const query = firstParam(searchParams.query);
  const status = firstParam(searchParams.status);
  const sort = firstParam(searchParams.sort) || '{"requestedAt":"DESC"}';

  // Fetch paginated certificate requests
  const requestsRes = await getInstructorCertificateRequests({
    page,
    size,
    query,
    sort,
    status: status === "all" ? undefined : status,
  });

  const requests = requestsRes?.data || [];
  const meta = requestsRes?.meta || { totalElements: 0, totalPages: 1, page: 1, limit: 10 };

  return (
    <InstructorCertificatesClient
      requests={requests}
      meta={meta}
      filters={{
        page,
        size,
        query: query || "",
        status: status || "all",
        sort,
      }}
    />
  );
}
