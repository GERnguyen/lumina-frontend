"use client";

import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Search,
  SlidersHorizontal,
  User,
  XCircle,
} from "lucide-react";
import type { CertificateRequestResponse, PaginatedMetadata } from "@/types";
import { formatShortDate } from "@/lib/format";
import { approveCertificateAction, rejectCertificateAction } from "@/services/actions/instructor";
import { Button, DataTable, DataTableEmptyState, DataTablePagination, Input, Select } from "../ui/shared";
import { InstructorBadge } from "../ui/shared/InstructorBadge";
import { InstructorButton } from "../ui/shared/InstructorButton";
import { InstructorCard } from "../ui/shared/InstructorCard";
import { InstructorDialog } from "../ui/shared/InstructorDialog";

interface InstructorCertificatesClientProps {
  requests: CertificateRequestResponse[];
  meta: PaginatedMetadata;
  filters: {
    page: number;
    size: number;
    query: string;
    status: string;
    sort: string;
  };
}

type CertificateRequestWithRelations = CertificateRequestResponse & {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  course?: {
    title?: string | null;
  } | null;
};

export function InstructorCertificatesClient({
  requests,
  meta,
  filters,
}: InstructorCertificatesClientProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(filters.query);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequestResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const totalElements = meta.totalElements ?? 0;
  const totalPages = meta.totalPages ?? 1;
  const currentPage = meta.page ?? 1;

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const activeFilters = { ...filters, ...newFilters };
    if (newFilters.query !== undefined || newFilters.status !== undefined) {
      activeFilters.page = 1;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("page", String(activeFilters.page));
    searchParams.set("size", String(activeFilters.size));
    searchParams.set("sort", activeFilters.sort);

    if (activeFilters.query) searchParams.set("query", activeFilters.query);
    if (activeFilters.status && activeFilters.status !== "all") searchParams.set("status", activeFilters.status);

    router.push(`/instructor/certificates?${searchParams.toString()}`);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateFilters({ query: searchVal.trim() });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateFilters({ page: newPage });
    }
  };

  const openApproveDialog = (request: CertificateRequestResponse) => {
    setSelectedRequest(request);
    setIsApproveOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const openRejectDialog = (request: CertificateRequestResponse) => {
    setSelectedRequest(request);
    setIsRejectOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleConfirmApprove = () => {
    if (!selectedRequest?.id) return;

    startTransition(async () => {
      const result = await approveCertificateAction(selectedRequest.id!);
      if (result.success) {
        setActionSuccess("Đã phê duyệt yêu cầu cấp chứng chỉ thành công.");
        setIsApproveOpen(false);
        setSelectedRequest(null);
        router.refresh();
      } else {
        setActionError(result.error || "Có lỗi xảy ra khi phê duyệt chứng chỉ.");
      }
    });
  };

  const handleConfirmReject = () => {
    if (!selectedRequest?.id) return;

    startTransition(async () => {
      const result = await rejectCertificateAction(selectedRequest.id!);
      if (result.success) {
        setActionSuccess("Đã từ chối yêu cầu cấp chứng chỉ.");
        setIsRejectOpen(false);
        setSelectedRequest(null);
        router.refresh();
      } else {
        setActionError(result.error || "Có lỗi xảy ra khi từ chối cấp chứng chỉ.");
      }
    });
  };

  const columns = useMemo<ColumnDef<CertificateRequestResponse>[]>(
    () => [
      {
        id: "course",
        header: "Khóa học",
        cell: ({ row }) => {
          const request = row.original as CertificateRequestWithRelations;
          const title = request.course?.title || `Khóa học ID: ${request.courseId?.substring(0, 8)}...`;

          return (
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary-100 bg-primary-50">
                <GraduationCap className="size-4 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="max-w-[240px] truncate text-xs font-bold text-gray-900" title={title}>
                  {title}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-gray-500">ID: {request.courseId}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "student",
        header: "Học viên",
        cell: ({ row }) => {
          const request = row.original as CertificateRequestWithRelations;
          const name = request.user?.name || request.user?.email || `Học viên ID: ${request.userId?.substring(0, 8)}...`;
          const email = request.user?.email || "Chưa cập nhật email";

          return (
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <User className="size-4 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="max-w-[200px] truncate text-xs font-bold text-gray-900" title={name}>
                  {name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-gray-500">{email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "requestedAt",
        header: "Ngày yêu cầu",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-gray-600">
            {row.original.requestedAt ? formatShortDate(row.original.requestedAt) : "Chưa cập nhật"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => <InstructorBadge type="publishStatus" value={row.original.status || "PENDING"} />,
      },
      {
        id: "approvedAt",
        header: "Ngày duyệt",
        cell: ({ row }) => (
          <span className="text-xs font-medium text-gray-600">
            {row.original.approvedAt ? formatShortDate(row.original.approvedAt) : "-"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Hành động</div>,
        cell: ({ row }) => {
          const request = row.original;

          if (request.status === "PENDING") {
            return (
              <div className="flex items-center justify-end gap-2">
                <InstructorButton variant="primary" size="sm" onClick={() => openApproveDialog(request)}>
                  Phê duyệt
                </InstructorButton>
                <InstructorButton variant="danger" size="sm" onClick={() => openRejectDialog(request)}>
                  Từ chối
                </InstructorButton>
              </div>
            );
          }

          if (request.status === "APPROVED" && request.certificateUrl) {
            return (
              <div className="flex justify-end">
                <Button asChild variant="ghost" size="sm" className="text-primary-600">
                  <a href={request.certificateUrl} target="_blank" rel="noopener noreferrer">
                    Xem chứng chỉ
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              </div>
            );
          }

          return <div className="text-right text-xs font-medium text-gray-400">Không có hành động</div>;
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <InstructorCard bodyClassName="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Danh sách yêu cầu cấp chứng chỉ</h2>
          <p className="mt-1 text-xs text-gray-500">
            Tổng cộng <span className="font-bold text-gray-700">{totalElements}</span> yêu cầu cần xử lý
          </p>
        </div>
      </InstructorCard>

      {actionSuccess ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          <div>{actionSuccess}</div>
        </div>
      ) : null}

      {actionError ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-800">
          <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
          <div>{actionError}</div>
        </div>
      ) : null}

      <InstructorCard
        title={
          <div className="-mx-6 flex items-center gap-2 border-b border-gray-100 px-6 pb-3 text-xs font-bold text-gray-900">
            <SlidersHorizontal className="size-4 text-primary-600" />
            <span>Bộ lọc tìm kiếm</span>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2">
            <Input
              type="text"
              placeholder="Tìm theo mã học viên, mã khóa học..."
              value={searchVal}
              onChange={(event) => setSearchVal(event.target.value)}
              leftIcon={<Search className="size-4" />}
              className="bg-gray-50"
            />
          </form>

          <Select
            value={filters.status}
            onValueChange={(value) => updateFilters({ status: value })}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "PENDING", label: "Chờ duyệt (Pending)" },
              { value: "APPROVED", label: "Đã duyệt (Approved)" },
              { value: "REJECTED", label: "Bị từ chối (Rejected)" },
            ]}
            triggerClassName="bg-gray-50"
          />

          <Select
            value={filters.sort}
            onValueChange={(value) => updateFilters({ sort: value })}
            options={[
              { value: '{"requestedAt":"DESC"}', label: "Mới nhất" },
              { value: '{"requestedAt":"ASC"}', label: "Cũ nhất" },
            ]}
            triggerClassName="bg-gray-50"
          />

          {filters.query || filters.status !== "all" ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <InstructorButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchVal("");
                  router.push("/instructor/certificates");
                }}
              >
                Xóa bộ lọc lựa chọn
              </InstructorButton>
            </div>
          ) : null}
        </div>
      </InstructorCard>

      <InstructorCard
        bodyClassName="p-0"
        footer={
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            itemLabel="yêu cầu"
            onPageChange={handlePageChange}
          />
        }
      >
        {requests.length === 0 ? (
          <DataTableEmptyState
            icon={Award}
            title="Không tìm thấy yêu cầu nào"
            description="Hãy thử điều chỉnh bộ lọc tìm kiếm hoặc quay lại sau."
          />
        ) : (
          <DataTable columns={columns} data={requests} minWidth={900} />
        )}
      </InstructorCard>

      <InstructorDialog
        isOpen={isApproveOpen}
        onClose={() => !isPending && setIsApproveOpen(false)}
        title="Xác nhận phê duyệt chứng chỉ"
        description="Vui lòng kiểm tra kỹ trước khi phê duyệt. Thao tác này sẽ chính thức cấp chứng chỉ hoàn thành khóa học cho học viên."
      >
        <CertificateDialogBody request={selectedRequest} />
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <InstructorButton variant="outline" size="sm" disabled={isPending} onClick={() => setIsApproveOpen(false)}>
            Hủy
          </InstructorButton>
          <InstructorButton variant="primary" size="sm" loading={isPending} onClick={handleConfirmApprove}>
            Xác nhận phê duyệt
          </InstructorButton>
        </div>
      </InstructorDialog>

      <InstructorDialog
        isOpen={isRejectOpen}
        onClose={() => !isPending && setIsRejectOpen(false)}
        title="Xác nhận từ chối chứng chỉ"
        description="Yêu cầu này sẽ bị từ chối và học viên cần gửi lại yêu cầu mới nếu đủ điều kiện."
      >
        <CertificateDialogBody request={selectedRequest} />
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <InstructorButton variant="outline" size="sm" disabled={isPending} onClick={() => setIsRejectOpen(false)}>
            Hủy
          </InstructorButton>
          <InstructorButton variant="danger" size="sm" loading={isPending} onClick={handleConfirmReject}>
            Xác nhận từ chối
          </InstructorButton>
        </div>
      </InstructorDialog>
    </div>
  );
}

function CertificateDialogBody({ request }: { request: CertificateRequestResponse | null }) {
  if (!request) return null;

  const requestWithRelations = request as CertificateRequestWithRelations;

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5 text-xs">
      <div className="flex justify-between gap-4">
        <span className="text-gray-500">Học viên:</span>
        <span className="font-bold text-gray-800">
          {requestWithRelations.user?.name || requestWithRelations.user?.email || request.userId}
        </span>
      </div>
      <div className="mt-2 flex justify-between gap-4">
        <span className="text-gray-500">Khóa học:</span>
        <span className="max-w-[260px] truncate font-bold text-gray-800" title={requestWithRelations.course?.title || undefined}>
          {requestWithRelations.course?.title || request.courseId}
        </span>
      </div>
    </div>
  );
}
