"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type {
  ProfileCourseFilter,
  ProfileCourseItem,
  ProfilePurchaseHistoryItem,
  ProfileWishlistItem,
  UserProfileDashboardData,
  UserProfileSettingsData,
} from "@/data/user-profile";
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
  { key: "settings", label: "Settings" },
  { key: "notifications", label: "Notifications" },
  { key: "certificates", label: "Certificates" },
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

function applyCourseFilters(courses: ProfileCourseItem[], filters: ProfileCourseFilter) {
  const query = filters.query?.trim().toLowerCase();
  let next = courses.filter((course) => {
    if (query) {
      const haystack = `${course.title} ${course.teacher} ${course.lesson}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.status && filters.status !== "all" && course.status !== filters.status) return false;
    if (filters.teacher && filters.teacher !== "all" && course.teacher !== filters.teacher) return false;
    return true;
  });

  if (filters.sort === "progress") {
    next = [...next].sort((a, b) => (b.progress || 0) - (a.progress || 0));
  } else if (filters.sort === "title") {
    next = [...next].sort((a, b) => a.title.localeCompare(b.title));
  }

  return next;
}

function CoursesTab({ courses, filters }: { courses: ProfileCourseItem[]; filters: ProfileCourseFilter }) {
  const [activeFilters, setActiveFilters] = useState<ProfileCourseFilter>(filters);
  const filteredCourses = useMemo(() => applyCourseFilters(courses, activeFilters), [activeFilters, courses]);

  return (
    <>
      <h2 className="text-2xl font-semibold tracking-normal text-[#1D2026]">
        Courses <span className="font-normal">({filteredCourses.length})</span>
      </h2>
      <div className="mt-6">
        <UserProfileCourseFilters filters={activeFilters} courses={courses} onChange={setActiveFilters} />
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {filteredCourses.map((course) => (
          <UserProfileCourseCard key={course.id} course={course} />
        ))}
      </div>
      {!filteredCourses.length ? (
        <div className="mt-8 rounded-[18px] border border-dashed border-[#D8D6FF] bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-[#1D2026]">No courses match your filters.</p>
          <p className="mt-2 text-sm text-[#6E7485]">Try a different keyword, status, or instructor.</p>
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
