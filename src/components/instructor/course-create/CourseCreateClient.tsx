"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, Image, ListTodo, Settings, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

import { CourseApi } from "@/services/api/course-api";
import type { CategoryResponse, CourseCurriculumResponse, CourseResponse } from "@/types";
import { cn } from "@/lib/utils";

import CourseBasicInfoForm from "./CourseBasicInfoForm";
import CourseImageUpload from "./CourseImageUpload";
import CourseCurriculumBuilder from "./CourseCurriculumBuilder";
import CourseLessonConfigurator from "./CourseLessonConfigurator";
import CourseFinalReview from "./CourseFinalReview";

interface CourseCreateClientProps {
  categories: CategoryResponse[];
  courseId?: string;
}

export default function CourseCreateClient({ categories, courseId: initialCourseId }: CourseCreateClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active step state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [courseId, setCourseId] = useState<string | undefined>(initialCourseId);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [curriculum, setCurriculum] = useState<CourseCurriculumResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(!!initialCourseId);
  const [error, setError] = useState<string | null>(null);
  const [rejectData, setRejectData] = useState<{ reason?: string; rejectedAt?: string } | null>(null);


  // Sync step from search params
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const parsedStep = parseInt(stepParam, 10);
      if (parsedStep >= 1 && parsedStep <= 5) {
        // If they try to go past step 1 without a courseId, force step 1
        if (parsedStep > 1 && !courseId) {
          setCurrentStep(1);
          router.replace("/instructor/courses/create?step=1");
        } else {
          setCurrentStep(parsedStep);
        }
      }
    }
  }, [searchParams, courseId, router]);

  // Load course details in edit mode
  const loadCourseData = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      let courseData = null;
      let isPublished = false;

      try {
        const pubRes = await CourseApi.getReadableCourseById(id);
        if (pubRes?.data?.publishStatus === "PUBLISHED") {
          courseData = pubRes.data;
          isPublished = true;
        }
      } catch (e) {
        // Safe to ignore: it's not published yet or has no public version
      }

      let curriculumData = null;

      if (isPublished && courseData) {
        // If course is published, fetch public/published curriculum
        const pubCurriculumRes = await CourseApi.getReadableCurriculum(id).catch(() => ({ data: { courseId: id, sections: [] } }));
        if (pubCurriculumRes?.data) {
          curriculumData = pubCurriculumRes.data;
        }
      } else {
        // Otherwise, fetch draft details and draft curriculum
        const draftRes = await CourseApi.getEditableCourseDraft(id);
        courseData = draftRes?.data || null;
        const curriculumRes = await CourseApi.getEditableDraftCurriculum(id).catch(() => ({ data: { courseId: id, sections: [] } }));
        if (curriculumRes?.data) {
          curriculumData = curriculumRes.data;
        }
      }

      if (courseData) {
        setCourse(courseData);
      }
      if (curriculumData) {
        setCurriculum(curriculumData);
      }

      let rejectReasonData = null;
      if (courseData && courseData.publishStatus === "REJECTED") {
        try {
          const rejectRes = await CourseApi.getRejectReason(id);
          if (rejectRes?.data) {
            rejectReasonData = rejectRes.data;
          }
        } catch (e) {
          console.error("Failed to load reject reason:", e);
        }
      }
      setRejectData(rejectReasonData);
    } catch (err: any) {

      console.error("Failed to load course details:", err);
      setError("Failed to load course details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCourseData(courseId);
    }
  }, [courseId]);

  // Handles updating the step URL parameter
  const setStep = (step: number) => {
    if (step > 1 && !courseId) return; // Prevent proceeding without course ID
    const basePath = courseId ? `/instructor/courses/edit/${courseId}` : "/instructor/courses/create";
    router.push(`${basePath}?step=${step}`);
  };

  // Callback when step 1 saves a new course
  const handleCourseCreated = (newId: string) => {
    setCourseId(newId);
    router.replace(`/instructor/courses/edit/${newId}?step=2`);
  };

  // Refresh curriculum from inside builders
  const handleRefreshData = () => {
    if (courseId) {
      loadCourseData(courseId);
    }
  };

  const steps = [
    { number: 1, label: "Basic Info", icon: BookOpen },
    { number: 2, label: "Cover Image", icon: Image },
    { number: 3, label: "Curriculum", icon: ListTodo },
    { number: 4, label: "Lesson Content", icon: Settings },
    { number: 5, label: "Publish", icon: CheckCircle },
  ];

  const renderActiveStep = () => {
    if (loading && !course) {
      return (
        <div className="flex h-64 flex-col items-center justify-center space-y-3">
          <Loader2 className="size-8 animate-spin text-primary-600" />
          <p className="text-xs text-gray-400 font-semibold">Loading draft course details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-xs text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => courseId && loadCourseData(courseId)}
            className="mt-3 text-xs font-bold text-primary-600 underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <CourseBasicInfoForm
            categories={categories}
            course={course}
            onSuccess={courseId ? handleRefreshData : handleCourseCreated}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <CourseImageUpload
            courseId={courseId!}
            images={course?.images || []}
            onSuccess={handleRefreshData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <CourseCurriculumBuilder
            courseId={courseId!}
            curriculum={curriculum}
            onSuccess={handleRefreshData}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );
      case 4:
        return (
          <CourseLessonConfigurator
            courseId={courseId!}
            curriculum={curriculum}
            onSuccess={handleRefreshData}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return (
          <CourseFinalReview
            course={course}
            curriculum={curriculum}
            onBack={() => setStep(4)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Heading */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/instructor/courses")}
            className="group flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              {courseId ? "Edit Course Draft" : "Create New Course"}
            </h1>
            {course?.title && (
              <p className="text-xs text-gray-400 font-medium truncate max-w-lg mt-0.5">
                {course.title}
              </p>
            )}
          </div>
        </div>
        {courseId && (
          <div className="hidden sm:block text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg select-none">
            Status: <span className="text-primary-600 font-bold">{course?.status || "DRAFT"}</span>
          </div>
        )}
      </div>

      {rejectData?.reason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-2xs animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-red-800">This Course was Rejected by Admin</h3>
                {rejectData.rejectedAt && (
                  <span className="text-xs text-red-600 font-semibold">
                    ({new Date(rejectData.rejectedAt).toLocaleDateString("vi-VN")})
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-red-700 leading-relaxed font-semibold">
                Reason: {rejectData.reason}
              </p>
              <p className="mt-2 text-[11px] text-red-500 font-medium">
                Please fix the issues outlined above and submit the course again for approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="mb-6 rounded-xl border border-zinc-150 bg-white p-5 shadow-2xs select-none">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;
            const isClickable = courseId !== undefined && step.number <= 5;

            return (
              <React.Fragment key={step.number}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setStep(step.number)}
                  className={cn(
                    "flex flex-1 items-center space-x-3.5 text-left transition-all p-2.5 rounded-xl focus:outline-none cursor-pointer",
                    isActive && "bg-primary-50/60 ring-1 ring-primary-100/50",
                    isClickable ? "hover:bg-zinc-50" : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition-all border-2",
                      isCompleted && "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-100",
                      isActive && "bg-white border-primary-600 text-primary-600 shadow-md shadow-primary-100/50 scale-105",
                      !isActive && !isCompleted && "bg-zinc-50 border-zinc-250 text-zinc-400"
                    )}
                  >
                    {isCompleted ? <CheckCircle className="size-5 text-white" /> : <StepIcon className="size-4.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                      Bước {step.number}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-bold transition-colors mt-0.5 truncate",
                        isActive ? "text-primary-750" : isCompleted ? "text-zinc-900" : "text-zinc-500"
                      )}
                    >
                      {step.label}
                    </p>
                  </div>
                </button>

                {/* Connecting lines for desktop */}
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "hidden md:block h-0.5 w-6 shrink-0 transition-colors",
                    currentStep > step.number ? "bg-emerald-300" : "bg-zinc-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="min-h-96">{renderActiveStep()}</div>
    </div>
  );
}
