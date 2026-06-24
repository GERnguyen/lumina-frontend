"use client";

import React, { useState, useEffect } from "react";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import type { CourseCurriculumResponse, LessonResponse } from "@/types";
import {
  Video,
  FileText,
  HelpCircle,
  Clipboard,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

import VideoLessonEditor from "./VideoLessonEditor";
import ArticleLessonEditor from "./ArticleLessonEditor";
import QuizLessonEditor from "./QuizLessonEditor";
import AssignmentLessonEditor from "./AssignmentLessonEditor";

interface CourseLessonConfiguratorProps {
  courseId: string;
  curriculum: CourseCurriculumResponse | null;
  onSuccess: () => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CourseLessonConfigurator({
  courseId,
  curriculum,
  onSuccess,
  onNext,
  onBack,
}: CourseLessonConfiguratorProps) {
  const sections = curriculum?.sections || [];

  // Track active lesson
  const [activeLesson, setActiveLesson] = useState<LessonResponse | null>(null);

  // Auto-select first lesson on mount
  useEffect(() => {
    if (sections.length > 0 && !activeLesson) {
      const firstSection = sections[0];
      const lessons = firstSection.lessons || [];
      if (lessons.length > 0) {
        setActiveLesson(lessons[0]);
      }
    }
  }, [sections, activeLesson]);

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "VIDEO":
        return <Video className="size-4.5 shrink-0" />;
      case "ARTICLE":
        return <FileText className="size-4.5 shrink-0" />;
      case "QUIZ":
        return <HelpCircle className="size-4.5 shrink-0" />;
      case "ASSIGNMENT":
        return <Clipboard className="size-4.5 shrink-0" />;
      default:
        return <FileText className="size-4.5 shrink-0" />;
    }
  };

  const renderEditor = () => {
    if (!activeLesson || !activeLesson.id) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/30 rounded-lg border border-gray-200 min-h-96">
          <Settings className="size-12 text-gray-300 mb-3 animate-spin-slow animate-pulse" />
          <p className="text-sm font-bold text-gray-500">Select a Unit to Configure</p>
          <p className="text-xs text-gray-400 font-medium max-w-sm mt-1 leading-relaxed">
            Choose any lesson block from the left curriculum list to load its workspace settings.
          </p>
        </div>
      );
    }

    switch (activeLesson.lessonType) {
      case "VIDEO":
        return <VideoLessonEditor courseId={courseId} lessonId={activeLesson.id} />;
      case "ARTICLE":
        return <ArticleLessonEditor courseId={courseId} lessonId={activeLesson.id} />;
      case "QUIZ":
        return <QuizLessonEditor courseId={courseId} lessonId={activeLesson.id} />;
      case "ASSIGNMENT":
        return <AssignmentLessonEditor courseId={courseId} lessonId={activeLesson.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 2-Pane layout (12-column grid: 3 columns sidebar, 9 columns editor workspace) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Left Pane: Navigation Outline */}
        <div className="md:col-span-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs">
          <div className="select-none border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">Unit Navigation</h3>
          </div>
          <div className="max-h-[600px] space-y-5 overflow-y-auto p-3">
            {sections.map((section, sIdx) => {
              const lessons = section.lessons || [];

              return (
                <div key={section.id} className="space-y-3">
                  <h4 className="px-4 py-3 text-sm font-semibold text-gray-500">
                    Sec {sIdx + 1}: {section.title}
                  </h4>
                  <div className="space-y-2">
                    {lessons.length > 0 ? (
                      lessons.map((lesson) => {
                        const isSelected = activeLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLesson(lesson)}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm font-medium transition-all cursor-pointer select-none",
                              isSelected
                                ? "border-primary-100 bg-primary-50 text-primary-600 shadow-xs"
                                : "text-gray-700 hover:bg-gray-50 border-transparent hover:text-gray-900"
                            )}
                          >
                            <div className="flex items-center space-x-3.5 truncate pr-2">
                              {getLessonIcon(lesson.lessonType)}
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            <ChevronRight className="size-4 text-gray-500 shrink-0" />
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-xs text-gray-500 italic px-2">
                        No lessons in section
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Workspace Editor */}
        <div className="md:col-span-9 min-h-[480px]">
          {activeLesson && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-3 select-none">
              <div>
                <span className="text-xs uppercase font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-md border border-primary-600/10">
                  Active Editor: {activeLesson.lessonType} UNIT
                </span>
                <h2 className="text-sm font-semibold text-gray-900 mt-2">{activeLesson.title}</h2>
              </div>
            </div>
          )}
          {renderEditor()}
        </div>

      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4">
        <InstructorButton variant="outline" icon={ArrowLeft} onClick={onBack} className="px-3 py-2.5 text-sm font-medium">
          Back
        </InstructorButton>
        <InstructorButton icon={ArrowRight} iconPosition="right" onClick={onNext} className="px-3 py-2.5 text-sm font-medium">
          Save & Next
        </InstructorButton>
      </div>
    </div>
  );
}
