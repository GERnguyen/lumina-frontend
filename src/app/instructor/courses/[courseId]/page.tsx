import type { Metadata } from "next";
import { InstructorCourseDetailClient } from "@/components/instructor/InstructorCourseDetailClient";
import {
  getInstructorAssignmentsData,
  getInstructorCourseOverviewData,
  getInstructorEngagementData,
  getInstructorLearnersProgressData,
  getInstructorQuizData,
} from "@/services/actions/instructor";

type TabValue = "overview" | "learners" | "assignments" | "quizzes" | "engagement";

type PageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Quản lý khóa học - Lumina Instructor",
  description: "Xem thống kê, học viên, bài tập, quiz và tương tác của khóa học.",
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseTab(value?: string): TabValue {
  if (value === "learners" || value === "assignments" || value === "quizzes" || value === "engagement") {
    return value;
  }
  return "overview";
}

export default async function InstructorCourseDetailPage({ params, searchParams }: PageProps) {
  const [{ courseId }, rawSearchParams] = await Promise.all([params, searchParams]);
  const activeTab = parseTab(firstParam(rawSearchParams.tab));

  const overview = await getInstructorCourseOverviewData(courseId).catch(() => ({
    course: null,
    curriculum: null,
    statistics: null,
    engagement: null,
    reviewStats: null,
    qnaStats: null,
  }));

  const isDraft = overview.course?.status === "DRAFT";

  let learners: any[] = [];
  let assignments: any[] = [];
  let quizzes: any[] = [];
  let engagementData: {
    reviews: any[];
    questions: any[];
    certificateRequests: any[];
  } = { reviews: [], questions: [], certificateRequests: [] };

  if (!isDraft) {
    const learnersPromise = activeTab === "learners" ? getInstructorLearnersProgressData(courseId) : Promise.resolve([]);
    const assignmentsPromise = activeTab === "assignments" ? getInstructorAssignmentsData(courseId) : Promise.resolve([]);
    const quizzesPromise = activeTab === "quizzes" ? getInstructorQuizData(courseId) : Promise.resolve([]);
    const engagementPromise = activeTab === "engagement" ? getInstructorEngagementData(courseId) : Promise.resolve({
      reviews: [],
      questions: [],
      certificateRequests: [],
    });

    const [learnersResult, assignmentsResult, quizzesResult, engagementResult] = await Promise.allSettled([
      learnersPromise,
      assignmentsPromise,
      quizzesPromise,
      engagementPromise,
    ]);

    learners = learnersResult.status === "fulfilled" ? learnersResult.value : [];
    assignments = assignmentsResult.status === "fulfilled" ? assignmentsResult.value : [];
    quizzes = quizzesResult.status === "fulfilled" ? quizzesResult.value : [];
    engagementData = engagementResult.status === "fulfilled"
      ? engagementResult.value
      : { reviews: [], questions: [], certificateRequests: [] };
  }

  return (
    <InstructorCourseDetailClient
      course={overview.course}
      curriculum={overview.curriculum}
      overview={{
        statistics: overview.statistics,
        engagement: overview.engagement,
        reviewStats: overview.reviewStats,
        qnaStats: overview.qnaStats,
      }}
      learners={learners}
      assignments={assignments}
      quizzes={quizzes}
      engagementData={engagementData}
      activeTab={isDraft ? "overview" : activeTab}
    />
  );
}
