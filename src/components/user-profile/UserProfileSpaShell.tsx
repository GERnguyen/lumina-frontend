"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type {
  ProfileCourseFilter,
  ProfileCourseItem,
  ProfilePurchaseHistoryItem,
  ProfileWishlistItem,
  UserProfileDashboardData,
  UserProfileSettingsData,
} from "@/data/user-profile";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import { LearningProgressApi } from "@/services/api/learning-api";
import { getCourseImage, getCourseInstructorName } from "@/lib/format";
import { UserProfileCourseCard } from "./UserProfileCourseCard";
import { UserProfileCourseFilters } from "./UserProfileCourseFilters";
import { UserProfileLearningCard } from "./UserProfileLearningCard";
import { UserProfilePurchaseHistoryList } from "./UserProfilePurchaseHistoryList";
import { UserProfileSettingsForm } from "./UserProfileSettingsForm";
import { UserProfileWishlistTable } from "./UserProfileWishlistTable";
import { UserProfileNotificationsList } from "./UserProfileNotificationsList";
import { UserProfileCertificatesList } from "./UserProfileCertificatesList";

type ProfileTabKey = "courses" | "wishlist" | "purchase-history" | "settings" | "notifications" | "certificates";

type UserProfileSpaShellProps = {
  user: UserProfileDashboardData["user"];
  totalEnrolled: number;
  activeCourses: number;
  completedCourses: number;
  learningCourses: UserProfileDashboardData["learningCourses"];
  courses: ProfileCourseItem[];
  courseFilters: ProfileCourseFilter;
  wishlistItems: ProfileWishlistItem[];
  purchases: ProfilePurchaseHistoryItem[];
  settings: UserProfileSettingsData;
};

const tabs: Array<{ key: ProfileTabKey; label: string }> = [
  { key: "courses", label: "Courses" },
  { key: "wishlist", label: "Wishlist" },
  { key: "purchase-history", label: "Purchase History" },
  { key: "notifications", label: "Notifications" },
  { key: "certificates", label: "Certificates" },
  { key: "settings", label: "Settings" },
];

export function UserProfileSpaShell({
  user,
  courses,
  courseFilters,
  wishlistItems,
  purchases,
  settings,
}: UserProfileSpaShellProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as ProfileTabKey | null;

  const [activeTab, setActiveTab] = useState<ProfileTabKey>(() => {
    if (tabParam && ["courses", "wishlist", "purchase-history", "settings", "notifications", "certificates"].includes(tabParam)) {
      return tabParam;
    }
    return "courses";
  });

  useEffect(() => {
    if (tabParam && ["courses", "wishlist", "purchase-history", "settings", "notifications", "certificates"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <>
      <section className="relative bg-[#EBEBFF] px-6 pt-20 lg:px-8">
        <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[18px] border border-[#D8D6FF] bg-white shadow-[0_14px_34px_rgba(86,79,253,0.08)]">
          <div className="flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-6">
              <div className="relative size-[110px] shrink-0 overflow-hidden rounded-full bg-[#E9EAF0]">
                <Image src={user.avatar} alt={user.name} fill priority sizes="110px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-normal text-[#1D2026]">{user.name}</h1>
                <p className="mt-3 text-base text-[#4E5566]">{user.headline}</p>
              </div>
            </div>

          </div>

          <nav className="border-t border-[#E9EAF0]" aria-label="Profile tabs">
            <div className="flex overflow-x-auto px-4 sm:justify-center sm:gap-6 sm:px-0">
              {tabs.map((tab) => (
                <button
                   key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex h-[68px] min-w-[168px] items-center justify-center text-center text-base font-semibold transition ${
                    activeTab === tab.key ? "text-[#1D2026]" : "text-[#4E5566] hover:text-[#564FFD]"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key ? <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#564FFD]" /> : null}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </section>

      <section className="px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-[1320px] animate-[fadeIn_180ms_ease-out]">
          {activeTab === "courses" ? <CoursesTab courses={courses} filters={courseFilters} /> : null}
          {activeTab === "wishlist" ? <WishlistTab items={wishlistItems} /> : null}
          {activeTab === "purchase-history" ? <PurchaseHistoryTab purchases={purchases} /> : null}
          {activeTab === "settings" ? <SettingsTab settings={settings} /> : null}
          {activeTab === "notifications" ? <UserProfileNotificationsList /> : null}
          {activeTab === "certificates" ? <UserProfileCertificatesList courses={courses} /> : null}
        </div>
      </section>
    </>
  );
}

function CoursesTab({ courses, filters }: { courses: ProfileCourseItem[]; filters: any }) {
  const [list, setList] = useState<ProfileCourseItem[]>(courses);
  const [activeFilters, setActiveFilters] = useState({
    query: "",
    sort: JSON.stringify({ enrolledAt: "DESC" }),
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(courses.length >= 20);

  const loaderRef = useRef<HTMLDivElement>(null);

  async function hydrateEnrolledCoursesProgress(enrolledCourses: any[]) {
    const enrolledIds = enrolledCourses.map((item) => item.course?.id).filter(Boolean) as string[];
    let progressList: any[] = [];
    if (enrolledIds.length > 0) {
      try {
        const progressRes = await LearningProgressApi.getCourseProgressByCourseIds(enrolledIds.join(","));
        progressList = progressRes.data || [];
      } catch (e) {
        console.error("Failed to fetch course progresses client-side:", e);
      }
    }
    return enrolledCourses.map((item, index) => {
      const course = item.course || {};
      const progressItem = progressList.find((p) => p.courseId === course.id);
      const progress = progressItem?.totalItems
        ? Math.round(((progressItem.completedItems || 0) / progressItem.totalItems) * 100)
        : undefined;

      return {
        id: course.id || `course-${index}-${Date.now()}`,
        title: course.title || "Untitled course",
        lesson: "Continue your learning",
        image: getCourseImage(course, index),
        progress,
        href: `/learning/${course.id}`,
        featured: false,
        teacher: getCourseInstructorName(course),
        isPassed: progressItem?.isPassed,
        status: (progressItem?.isCompleted && progressItem?.isPassed ? "completed" as const : "active" as const) as "all" | "active" | "completed",
        enrolledAt: item.enrolledAt,
      };
    });
  }

  // Reset and fetch first page on filter change
  useEffect(() => {
    let active = true;
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        const res = await EnrollmentApi.getEnrolledCourses({
          page: 1,
          size: 12,
          query: activeFilters.query || undefined,
          sort: activeFilters.sort || undefined,
        });
        if (!active) return;
        const enrolled = res.data || [];
        const mapped = await hydrateEnrolledCoursesProgress(enrolled);
        setList(mapped);
        setPage(1);
        setHasMore(enrolled.length >= 12);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchFirstPage();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeFilters]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await EnrollmentApi.getEnrolledCourses({
        page: nextPage,
        size: 12,
        query: activeFilters.query || undefined,
        sort: activeFilters.sort || undefined,
      });
      const enrolled = res.data || [];
      const mapped = await hydrateEnrolledCoursesProgress(enrolled);
      setList((prev) => [...prev, ...mapped]);
      setPage(nextPage);
      setHasMore(enrolled.length >= 12);
    } catch (err) {
      console.error("Failed to load more courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, page, activeFilters]);

  return (
    <>
      <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">
        Courses <span className="font-normal">({list.length})</span>
      </h2>
      <div className="mt-6">
        <UserProfileCourseFilters filters={activeFilters} onChange={setActiveFilters} />
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((course) => (
          <UserProfileCourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Infinite Scroll Loader Target */}
      <div ref={loaderRef} className="flex justify-center py-6">
        {loading && <Loader2 className="size-6 animate-spin text-[#564FFD]" />}
      </div>

      {!list.length && !loading ? (
        <div className="mt-8 rounded-[18px] border border-dashed border-[#D8D6FF] bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#1D2026]">No courses match your filters.</p>
          <p className="mt-2 text-sm text-[#6E7485]">Try a different keyword.</p>
        </div>
      ) : null}
    </>
  );
}

function WishlistTab({ items }: { items: ProfileWishlistItem[] }) {
  return (
    <>
      <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">Wishlist</h2>
      <div className="mt-6">
        <UserProfileWishlistTable items={items} />
      </div>
    </>
  );
}

function PurchaseHistoryTab({ purchases }: { purchases: ProfilePurchaseHistoryItem[] }) {
  return (
    <>
      <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">Purchase History</h2>
      <div className="mt-6">
        <UserProfilePurchaseHistoryList purchases={purchases} />
      </div>
    </>
  );
}

function SettingsTab({ settings }: { settings: UserProfileSettingsData }) {
  return (
    <UserProfileSettingsForm settings={settings} />
  );
}
