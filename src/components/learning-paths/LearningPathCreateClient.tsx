"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LearningPathApi } from "@/services/api/learning-api";
import { CourseApi } from "@/services/api/course-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import type { CourseResponse, LessonResponse, LearningPathItemRequest } from "@/types";
import { ArrowLeft, ArrowUp, ArrowDown, Trash2, Plus, Loader2, BookOpen, GripVertical } from "lucide-react";

interface LearningPathCreateClientProps {
  header: React.ReactNode;
  footer: React.ReactNode;
}

interface PathSelectedItem {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
}

export function LearningPathCreateClient({ header, footer }: LearningPathCreateClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [enrolledCourses, setEnrolledCourses] = useState<CourseResponse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  
  const [selectedItems, setSelectedItems] = useState<PathSelectedItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch enrolled courses on mount
  useEffect(() => {
    async function fetchEnrolled() {
      try {
        setLoadingCourses(true);
        const res = await EnrollmentApi.getEnrolledCourses({ page: 1, size: 100 });
        if (res?.data) {
          const courses = res.data.map((item) => item.course).filter(Boolean) as CourseResponse[];
          setEnrolledCourses(courses);
          if (courses.length > 0) {
            setSelectedCourseId(courses[0].id || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchEnrolled();
  }, []);

  // Fetch course curriculum when selected course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      setSelectedLessonId("");
      return;
    }

    async function fetchLessons() {
      try {
        setLoadingLessons(true);
        const res = await CourseApi.getReadableCurriculum(selectedCourseId);
        const flatLessons: LessonResponse[] = [];
        
        if (res?.data?.sections) {
          res.data.sections.forEach((section: any) => {
            if (section.lessons) {
              flatLessons.push(...section.lessons);
            }
          });
        }
        
        setLessons(flatLessons);
        if (flatLessons.length > 0) {
          setSelectedLessonId(flatLessons[0].id || "");
        } else {
          setSelectedLessonId("");
        }
      } catch (err) {
        console.error("Failed to fetch curriculum:", err);
        setLessons([]);
        setSelectedLessonId("");
      } finally {
        setLoadingLessons(false);
      }
    }

    fetchLessons();
  }, [selectedCourseId]);

  function handleAddItem() {
    if (!selectedCourseId || !selectedLessonId) return;

    const course = enrolledCourses.find((c) => c.id === selectedCourseId);
    const lesson = lessons.find((l) => l.id === selectedLessonId);

    if (!course || !lesson) return;

    // Check if duplicate
    const isDuplicate = selectedItems.some(
      (item) => item.courseId === selectedCourseId && item.lessonId === selectedLessonId
    );

    if (isDuplicate) {
      alert("Bài học này đã có trong lộ trình của bạn.");
      return;
    }

    const newItem: PathSelectedItem = {
      courseId: selectedCourseId,
      courseTitle: course.title || "Khóa học không tên",
      lessonId: selectedLessonId,
      lessonTitle: lesson.title || "Bài học không tên",
    };

    setSelectedItems([...selectedItems, newItem]);
  }

  function handleRemoveItem(index: number) {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const newItems = [...selectedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setSelectedItems(newItems);
  }

  function handleMoveDown(index: number) {
    if (index === selectedItems.length - 1) return;
    const newItems = [...selectedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setSelectedItems(newItems);
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...selectedItems];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setSelectedItems(newItems);
    setDraggedIndex(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (!title.trim()) {
      setError("Vui lòng điền tiêu đề lộ trình.");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Vui lòng thêm ít nhất một bài học vào lộ trình.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const itemsPayload: LearningPathItemRequest[] = selectedItems.map((item, index) => ({
        courseId: item.courseId,
        lessonId: item.lessonId,
        orderIndex: index,
        isSuggested: false,
      }));

      await LearningPathApi.createLearningPath({
        title: title.trim(),
        description: description.trim() || undefined,
        items: itemsPayload,
      });

      router.push("/learning-paths");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to create learning path:", err);
      setError(err?.message || "Có lỗi xảy ra khi tạo lộ trình học tập.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FB]">
      {header}

      <div className="mx-auto max-w-[1000px] px-6 py-10 lg:px-8">
        <Link
          href="/learning-paths"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#564FFD] hover:text-[#433EE8] transition"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại lộ trình của tôi</span>
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-[#1D2026]">Thiết kế Lộ trình học mới</h1>
        <p className="mt-2 text-[#6E7485]">Kết hợp các bài học cụ thể từ các khóa học của bạn thành một lộ trình hoàn hảo.</p>

        {error && (
          <div className="mt-6 rounded-[18px] border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 md:grid-cols-3">
          {/* Main Form Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Info Card */}
            <div className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-[#1D2026] mb-4">1. Thông tin chung</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-[#1D2026]">
                    Tiêu đề lộ trình *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Luyện tập Frontend nâng cao, DevOps cơ bản..."
                    className="mt-2 h-12 w-full rounded-[14px] border border-[#E9EAF0] px-4 text-base text-[#1D2026] outline-none transition focus:border-[#564FFD] focus:ring-1 focus:ring-[#564FFD]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-[#1D2026]">
                    Mô tả (Tùy chọn)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mục tiêu của lộ trình này là gì? Ghi chú các kỹ năng cần đạt..."
                    rows={4}
                    className="mt-2 w-full rounded-[14px] border border-[#E9EAF0] p-4 text-base text-[#1D2026] outline-none transition focus:border-[#564FFD] focus:ring-1 focus:ring-[#564FFD]"
                  />
                </div>
              </div>
            </div>

            {/* List Selection Card */}
            <div className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-[#1D2026] mb-4">2. Các bài học đã chọn</h3>

              {selectedItems.length > 0 ? (
                <div className="space-y-3">
                  {selectedItems.map((item, index) => (
                    <div
                      key={`${item.courseId}-${item.lessonId}-${index}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`flex items-center justify-between gap-4 rounded-xl border p-4 bg-[#F8F9FB] transition duration-200 cursor-grab active:cursor-grabbing hover:border-[#564FFD] hover:shadow-sm ${
                        draggedIndex === index
                          ? "opacity-50 border-dashed border-[#564FFD] bg-white"
                          : "border-[#E9EAF0]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-gray-400 shrink-0 cursor-grab active:cursor-grabbing">
                          <GripVertical className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#8C94A3] uppercase line-clamp-1">
                            Bước {index + 1}: {item.courseTitle}
                          </span>
                          <h4 className="mt-0.5 text-sm font-semibold text-[#1D2026] line-clamp-1">{item.lessonTitle}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="flex size-8 items-center justify-center rounded-lg border border-[#E9EAF0] bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === selectedItems.length - 1}
                          className="flex size-8 items-center justify-center rounded-lg border border-[#E9EAF0] bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="flex size-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Xóa bước học"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#D8D6FF] p-8 text-center text-sm text-[#6E7485]">
                  Chưa có bài học nào được thêm. Hãy chọn và thêm bài học ở thanh bên phải.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link
                href="/learning-paths"
                className="inline-flex h-12 items-center justify-center rounded-[18px] border border-[#E9EAF0] bg-white px-6 text-base font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] px-8 text-base font-semibold text-white hover:bg-[#433EE8] disabled:opacity-50 transition shadow-md"
              >
                {submitting && <Loader2 className="size-5 animate-spin" />}
                <span>Tạo lộ trình học</span>
              </button>
            </div>
          </div>

          {/* Sidebar selector */}
          <div className="space-y-6">
            <div className="rounded-[18px] border border-[#E9EAF0] bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg text-[#1D2026] flex items-center gap-2 mb-4">
                <BookOpen className="size-5 text-[#564FFD]" />
                <span>Thêm bài học</span>
              </h3>

              {loadingCourses ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="size-6 animate-spin text-[#564FFD]" />
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="text-center text-sm text-[#6E7485] py-4">
                  Bạn chưa đăng ký khóa học nào. Hãy đăng ký khóa học trước khi thiết kế lộ trình.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Course */}
                  <div>
                    <label htmlFor="courseSelect" className="block text-xs font-semibold text-[#8C94A3] uppercase">
                      Chọn khóa học
                    </label>
                    <select
                      id="courseSelect"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-[#E9EAF0] bg-white px-3 text-sm text-[#1D2026] outline-none transition focus:border-[#564FFD]"
                    >
                      {enrolledCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Lesson */}
                  <div>
                    <label htmlFor="lessonSelect" className="block text-xs font-semibold text-[#8C94A3] uppercase">
                      Chọn bài học
                    </label>
                    {loadingLessons ? (
                      <div className="flex items-center gap-2 py-3 text-sm text-[#6E7485]">
                        <Loader2 className="size-4 animate-spin text-[#564FFD]" />
                        <span>Đang tải danh sách bài học...</span>
                      </div>
                    ) : lessons.length === 0 ? (
                      <div className="text-xs text-red-600 mt-2">
                        Khóa học này không có bài học nào.
                      </div>
                    ) : (
                      <select
                        id="lessonSelect"
                        value={selectedLessonId}
                        onChange={(e) => setSelectedLessonId(e.target.value)}
                        className="mt-2 h-11 w-full rounded-xl border border-[#E9EAF0] bg-white px-3 text-sm text-[#1D2026] outline-none transition focus:border-[#564FFD]"
                      >
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            [{lesson.lessonType}] {lesson.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedCourseId || !selectedLessonId || loadingLessons}
                    className="flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-[#EBEBFF] text-[#564FFD] hover:bg-[#DEDDFF] disabled:opacity-40 text-sm font-semibold transition"
                  >
                    <Plus className="size-4" />
                    <span>Thêm vào lộ trình</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {footer}
    </main>
  );
}
