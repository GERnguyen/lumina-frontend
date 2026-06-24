import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { InstructorCard } from "@/components/ui/shared/InstructorCard";

interface CoursesFilterBarProps {
  filters: {
    query: string;
    status: string;
    publishStatus: string;
    categoryId: string;
    sort: string;
  };
  searchVal: string;
  setSearchVal: (val: string) => void;
  categoryOptions: { value: string; label: string }[];
  updateFilters: (newFilters: Partial<{
    page: number;
    size: number;
    query: string;
    status: string;
    publishStatus: string;
    categoryId: string;
    sort: string;
  }>) => void;
  onClearFilters: () => void;
}

export function CoursesFilterBar({
  filters,
  searchVal,
  setSearchVal,
  categoryOptions,
  updateFilters,
  onClearFilters,
}: CoursesFilterBarProps) {
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateFilters({ query: searchVal.trim() });
  };

  const hasActiveFilters =
    filters.query ||
    filters.status !== "all" ||
    filters.publishStatus !== "all" ||
    filters.categoryId !== "all";

  return (
    <InstructorCard
      title={
        <div className="-mx-6 flex items-center gap-2 border-b border-zinc-100 px-6 pb-3 text-xs font-bold text-zinc-800 tracking-wider uppercase select-none">
          <SlidersHorizontal className="size-4 text-primary-600" />
          <span>Bộ lọc tìm kiếm</span>
        </div>
      }
      className="border-zinc-200/50 shadow-xs"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2">
            <Input
              type="text"
              placeholder="Tìm theo tên khóa học..."
              value={searchVal}
              onChange={(event) => setSearchVal(event.target.value)}
              leftIcon={<Search className="size-4 text-zinc-400" />}
              className="bg-zinc-50/50 hover:bg-zinc-50 border-zinc-200/70 focus:bg-white transition-all text-sm rounded-lg"
            />
          </form>

          {/* Categories */}
          <Select
            value={filters.categoryId}
            onValueChange={(value) => updateFilters({ categoryId: value })}
            options={categoryOptions}
            triggerClassName="bg-zinc-50/50 border-zinc-200/70 hover:bg-zinc-50 transition-all text-xs font-semibold h-10 rounded-lg text-zinc-700"
          />

          {/* Active status */}
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilters({ status: value })}
            options={[
              { value: "all", label: "Trạng thái hoạt động (Tất cả)" },
              { value: "PUBLISHED", label: "Đã xuất bản (Active)" },
              { value: "DRAFT", label: "Bản nháp (Draft)" },
              { value: "ARCHIVED", label: "Lưu trữ (Archived)" },
            ]}
            triggerClassName="bg-zinc-50/50 border-zinc-200/70 hover:bg-zinc-50 transition-all text-xs font-semibold h-10 rounded-lg text-zinc-700"
          />

          {/* Publish status */}
          <Select
            value={filters.publishStatus}
            onValueChange={(value) => updateFilters({ publishStatus: value })}
            options={[
              { value: "all", label: "Trạng thái duyệt (Tất cả)" },
              { value: "WAITING_APPROVAL", label: "Chờ duyệt (Pending)" },
              { value: "PUBLISHED", label: "Đã duyệt (Approved)" },
              { value: "REJECTED", label: "Bị từ chối (Rejected)" },
            ]}
            triggerClassName="bg-zinc-50/50 border-zinc-200/70 hover:bg-zinc-50 transition-all text-xs font-semibold h-10 rounded-lg text-zinc-700"
          />
        </div>

        {/* Bottom Sorting and Action section */}
        <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-455">
              Sắp xếp theo:
            </span>
            <Select
              value={filters.sort}
              onValueChange={(value) => updateFilters({ sort: value })}
              options={[
                { value: '{"updatedAt":"DESC"}', label: "Cập nhật mới nhất" },
                { value: '{"updatedAt":"ASC"}', label: "Cập nhật cũ nhất" },
                { value: '{"title":"ASC"}', label: "Tên khóa học A-Z" },
                { value: '{"title":"DESC"}', label: "Tên khóa học Z-A" },
                { value: '{"enrollmentCount":"DESC"}', label: "Học viên giảm dần" },
                { value: '{"price":"ASC"}', label: "Giá tăng dần" },
                { value: '{"price":"DESC"}', label: "Giá giảm dần" },
              ]}
              triggerClassName="min-w-56 h-9 text-xs bg-transparent border-zinc-200 hover:bg-zinc-50 transition-all rounded-lg text-zinc-700"
            />
          </div>

          {hasActiveFilters && (
            <InstructorButton
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs font-bold text-zinc-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              Xóa bộ lọc lựa chọn
            </InstructorButton>
          )}
        </div>
      </div>
    </InstructorCard>
  );
}
