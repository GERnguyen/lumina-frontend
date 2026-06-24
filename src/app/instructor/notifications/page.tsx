import { getInstructorNotificationsAction } from "@/services/actions/instructor";
import { InstructorNotificationsPage } from "@/components/instructor/notifications/InstructorNotificationsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông báo - Giảng viên",
  description: "Xem và quản lý tất cả các thông báo của bạn trên Cinx.",
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

  const listRes = await getInstructorNotificationsAction({ page, size });

  const notifications = listRes?.data || [];
  const meta = listRes?.meta || { totalElements: 0, totalPages: 1, page: 1, limit: 10 };

  return (
    <InstructorNotificationsPage
      notifications={notifications}
      meta={meta}
      filters={{
        page,
        size,
      }}
    />
  );
}
