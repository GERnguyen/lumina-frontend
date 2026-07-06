"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseApi } from "@/services/api/course-api";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import type { CourseResponse, CourseCurriculumResponse } from "@/types";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Video,
  HelpCircle,
  Clipboard,
  AlertTriangle,
  Award,
  DollarSign,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { useToastStore } from "@/stores/toast-store";
import { money } from "@/lib/format";



interface CourseFinalReviewProps {
  course: CourseResponse | null;
  curriculum: CourseCurriculumResponse | null;
  onBack: () => void;
}

export default function CourseFinalReview({ course, curriculum, onBack }: CourseFinalReviewProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const sections = curriculum?.sections || [];
  const images = course?.images || [];
  const coverImage = images[0]?.imageUrl;

  // Count metrics
  const totalSections = sections.length;
  const totalLessons = sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0);

  // Validation checks
  const validationErrors: string[] = [];
  if (!course?.title) validationErrors.push("Course metadata missing (title).");
  if (!course?.description) validationErrors.push("Course description is required.");
  if (totalSections === 0) validationErrors.push("Curriculum must have at least one section.");
  if (totalLessons === 0) validationErrors.push("Curriculum must have at least one lesson unit.");

  const isValid = validationErrors.length === 0;

  const handleSubmit = async () => {
    if (!course?.id || !isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      await CourseApi.submitCourse(course.id);
      addToast("Course draft submitted for review successfully!", "success", "Submission Successful");
      router.push("/instructor/courses");

    } catch (err: any) {
      console.error("Failed to submit course:", err);
      setError(err?.message || "Could not submit course for review. Check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="size-4.5 text-primary-600" />;
      case "ARTICLE":
        return <FileText className="size-4.5 text-emerald-500" />;
      case "QUIZ":
        return <HelpCircle className="size-4.5 text-orange-500" />;
      case "ASSIGNMENT":
        return <Clipboard className="size-4.5 text-primary-600" />;
      default:
        return <FileText className="size-4.5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 text-red-600 p-4 text-xs font-semibold border border-red-100">
          {error}
        </div>
      )}

      {/* Validation status box */}
      {!isValid ? (
        <div className="rounded-lg border border-red-150 bg-red-50/50 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="size-5 shrink-0" />
            <h3 className="text-xs font-extrabold">Course Submission Blocked</h3>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Please resolve the following draft requirements before requesting publication review:
          </p>
          <ul className="list-disc pl-5 text-[10px] text-red-600 font-bold space-y-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      ) :
        course?.publishStatus !== "PUBLISHED" && (
          <div className="rounded-lg border border-emerald-150 bg-emerald-50/30 p-5 flex items-center space-x-3 select-none">
            <CheckCircle className="size-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-extrabold text-emerald-800">Ready to Submit!</h3>
              <p className="text-xs text-emerald-700/80 font-medium mt-0.5">
                All validations passed. Once submitted, administrators will review and approve your curriculum for listing.
              </p>
            </div>
          </div>
        )}

      {/* Review details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Course Info Cards */}
        <div className="md:col-span-2 space-y-6">

          {/* Metadata Card */}
          <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-4">
            <h3 className="border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">Course Overview</h3>

            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-gray-900 leading-tight">{course?.title}</h4>
              <p className="whitespace-pre-line text-xs text-muted-foreground">
                {course?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 select-none">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                <DollarSign className="size-4 text-gray-400" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Price</p>
                  <p className="text-gray-900 mt-0.5">
                    {course?.discountedPrice && course.price && course.discountedPrice < course.price ? (
                      <span>
                        <span className="line-through text-gray-400 mr-1.5">{money(course.price)}</span>
                        <span className="text-primary-600">{money(course.discountedPrice)}</span>
                      </span>
                    ) : (
                      <span>{money(course?.price || 0)}</span>
                    )}
                  </p>
                </div>
              </div>


              {course?.duration && (
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                  <Clock className="size-4 text-gray-400" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Duration</p>
                    <p className="text-gray-900 mt-0.5">{course.duration} minutes</p>
                  </div>
                </div>
              )}

              {course?.hasCertificate && (
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
                  <Award className="size-4 text-primary-600" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Certificate</p>
                    <p className="text-gray-900 mt-0.5 truncate max-w-[120px]">{course.certificateTitle || "Enabled"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cover image preview card */}
          {coverImage && (
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-xs">
              <div className="select-none border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-800">Banner Illustration</h3>
              </div>
              <div className="p-4 bg-gray-50/20">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="aspect-video w-full max-w-xl mx-auto rounded-lg object-cover border border-gray-200 shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Curriculum Map */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">Curriculum Map</h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {sections.length > 0 ? (
                sections.map((section, sIdx) => (
                  <div key={section.id} className="space-y-2">
                    <h4 className="rounded-md bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-600">
                      Chapter {sIdx + 1}: {section.title}
                    </h4>
                    <div className="space-y-2">
                      {section.lessons?.map((lesson) => (
                        <div key={lesson.id} className="flex items-center space-x-2 rounded-lg p-3 text-sm font-medium text-gray-700 truncate">
                          {getLessonIcon(lesson.lessonType)}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 italic">No sections created yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <InstructorButton variant="outline" icon={ArrowLeft} onClick={onBack} className="px-3 py-2.5 text-sm font-medium">
          Back
        </InstructorButton>
        {course?.publishStatus !== "PUBLISHED" && (
          <InstructorButton
            icon={Send}
            onClick={handleSubmit}
            loading={submitting}
            disabled={!isValid}
            className="px-3 py-2.5 text-sm font-medium shadow-sm"
          >
            Submit for Review
          </InstructorButton>
        )}
      </div>

    </div>
  );
}
