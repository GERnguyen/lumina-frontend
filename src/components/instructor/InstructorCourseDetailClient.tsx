"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  HelpCircle,
  MessageSquare,
  Users,
} from "lucide-react";
import type {
  AssignmentSubmissionResponse,
  CertificateRequestResponse,
  CourseCurriculumResponse,
  CourseEngagementOverviewResponse,
  CourseResponse,
  CourseStatisticsResponse,
  QuestionDto,
  ReviewResponse,
  ReviewStatisticsResponse,
  CourseQnAStatisticsResponse,
} from "@/types";
import type { InstructorLearnerProgress, InstructorQuizLessonData } from "@/services/actions/instructor";
import { Button, InstructorTabs } from "@/components/ui/shared";

// Subcomponents
import { CourseHeader } from "./course-detail/CourseHeader";
import { OverviewTab } from "./course-detail/OverviewTab";
import { LearnersTab } from "./course-detail/LearnersTab";
import { AssignmentsTab } from "./course-detail/AssignmentsTab";
import { QuizzesTab } from "./course-detail/QuizzesTab";
import { EngagementTab } from "./course-detail/EngagementTab";

type TabValue = "overview" | "learners" | "assignments" | "quizzes" | "engagement";

type AssignmentSubmissionWithTitle = AssignmentSubmissionResponse & {
  assignmentTitle?: string;
};

interface EngagementData {
  reviews: ReviewResponse[];
  questions: QuestionDto[];
  certificateRequests: CertificateRequestResponse[];
}

interface OverviewData {
  statistics: CourseStatisticsResponse | null;
  engagement: CourseEngagementOverviewResponse | null;
  reviewStats: ReviewStatisticsResponse | null;
  qnaStats: CourseQnAStatisticsResponse | null;
}

interface InstructorCourseDetailClientProps {
  course: CourseResponse | null;
  curriculum: CourseCurriculumResponse | null;
  overview: OverviewData;
  learners: InstructorLearnerProgress[];
  assignments: AssignmentSubmissionWithTitle[];
  quizzes: InstructorQuizLessonData[];
  engagementData: EngagementData;
  activeTab: TabValue;
}

const tabs = [
  { value: "overview", label: "Tổng quan", icon: BarChart3 },
  { value: "learners", label: "Học viên", icon: Users },
  { value: "assignments", label: "Bài tập", icon: ClipboardCheck },
  { value: "quizzes", label: "Quiz", icon: HelpCircle },
  { value: "engagement", label: "Tương tác", icon: MessageSquare },
];

export function InstructorCourseDetailClient({
  course,
  curriculum,
  overview,
  learners,
  assignments,
  quizzes,
  engagementData,
  activeTab,
}: InstructorCourseDetailClientProps) {
  const router = useRouter();
  const isDraft = course?.status === "DRAFT";
  const visibleTabs = isDraft ? tabs.filter((item) => item.value === "overview") : tabs;
  const tab = visibleTabs.some((item) => item.value === activeTab) ? activeTab : "overview";
  const courseId = course?.id;

  const handleTabChange = (value: string) => {
    if (!courseId) return;
    router.push(`/instructor/courses/${courseId}?tab=${value}`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <CourseHeader course={course} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InstructorTabs tabs={visibleTabs} value={tab} onChange={handleTabChange} className="w-full overflow-x-auto sm:w-auto" />
        <Button asChild variant="outline" size="sm" className="h-9 px-4 rounded-lg text-zinc-700 border-zinc-200 hover:bg-zinc-50 font-bold transition-all">
          <Link href="/instructor/courses">Quay lại danh sách</Link>
        </Button>
      </div>

      {tab === "overview" && (
        <OverviewTab course={course} curriculum={curriculum} overview={overview} />
      )}
      {tab === "learners" && (
        <LearnersTab courseId={courseId} learners={learners} />
      )}
      {tab === "assignments" && (
        <AssignmentsTab courseId={courseId} assignments={assignments} />
      )}
      {tab === "quizzes" && (
        <QuizzesTab quizzes={quizzes} />
      )}
      {tab === "engagement" && (
        <EngagementTab courseId={courseId} data={engagementData} />
      )}
    </div>
  );
}
