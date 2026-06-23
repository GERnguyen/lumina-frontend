"use client";

import React, { useState } from "react";
import { SectionApi, LessonApi, CourseApi } from "@/services/api/course-api";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { InstructorDialog } from "@/components/ui/shared/InstructorDialog";
import { InstructorSwitch } from "@/components/ui/shared/InstructorSwitch";
import { Input, Select } from "@/components/ui/shared";
import { InstructorTextarea } from "@/components/ui/shared/InstructorTextarea";
import type { CourseCurriculumResponse, CurriculumSectionResponse, LessonResponse } from "@/types";
import {
  Plus,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  Video,
  FileText,
  HelpCircle,
  Clipboard,
  Move,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface CourseCurriculumBuilderProps {
  courseId: string;
  curriculum: CourseCurriculumResponse | null;
  onSuccess: () => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CourseCurriculumBuilder({
  courseId,
  curriculum,
  onSuccess,
  onNext,
  onBack,
}: CourseCurriculumBuilderProps) {
  // Modal states
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CurriculumSectionResponse | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<"VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT">("VIDEO");
  const [isPreview, setIsPreview] = useState(false);
  const [lessonDuration, setLessonDuration] = useState<number | undefined>(undefined);

  // Loading & error states
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and Drop tracking
  const [draggedItem, setDraggedItem] = useState<{ type: "section" | "lesson"; id: string; index: number; sectionId?: string } | null>(null);

  const sections = curriculum?.sections || [];

  // Reset Section Modal
  const openSectionModal = (sec?: CurriculumSectionResponse) => {
    setError(null);
    if (sec) {
      setEditingSection(sec);
      setSectionTitle(sec.title || "");
      setSectionDesc(sec.description || "");
    } else {
      setEditingSection(null);
      setSectionTitle("");
      setSectionDesc("");
    }
    setSectionModalOpen(true);
  };

  // Save Section
  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    setActionLoading(true);
    setError(null);

    try {
      if (editingSection?.id) {
        // Update section
        await SectionApi.updateSection(courseId, editingSection.id, {
          title: sectionTitle,
          description: sectionDesc || undefined,
        });
      } else {
        // Create section
        await SectionApi.createSection(courseId, {
          title: sectionTitle,
          description: sectionDesc || undefined,
        });
      }
      setSectionModalOpen(false);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to save section:", err);
      setError(err?.message || "Could not save section.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Section
  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section and all of its lessons? This cannot be undone.")) return;

    setActionLoading(true);
    setError(null);
    try {
      await SectionApi.deleteSection(courseId, sectionId);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to delete section:", err);
      setError(err?.message || "Could not delete section.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Lesson Modal
  const openLessonModal = (secId: string, les?: LessonResponse) => {
    setError(null);
    setTargetSectionId(secId);
    if (les) {
      setEditingLesson(les);
      setLessonTitle(les.title || "");
      setLessonType(les.lessonType || "VIDEO");
      setIsPreview(les.isPreview || false);
      setLessonDuration(les.duration);
    } else {
      setEditingLesson(null);
      setLessonTitle("");
      setLessonType("VIDEO");
      setIsPreview(false);
      setLessonDuration(undefined);
    }
    setLessonModalOpen(true);
  };

  // Save Lesson
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !targetSectionId) return;

    setActionLoading(true);
    setError(null);

    try {
      if (editingLesson?.id) {
        // Update lesson
        await LessonApi.updateLesson(courseId, targetSectionId, editingLesson.id, {
          title: lessonTitle,
          isPreview,
          duration: lessonDuration || undefined,
        });
      } else {
        // Create lesson
        await LessonApi.createLesson(courseId, targetSectionId, {
          title: lessonTitle,
          lessonType,
          isPreview,
          duration: lessonDuration || undefined,
        });
      }
      setLessonModalOpen(false);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to save lesson:", err);
      setError(err?.message || "Could not save lesson.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    setActionLoading(true);
    setError(null);
    try {
      await LessonApi.deleteLesson(courseId, sectionId, lessonId);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to delete lesson:", err);
      setError(err?.message || "Could not delete lesson.");
    } finally {
      setActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Positional API Swaps (Up/Down Actions)
  // ──────────────────────────────────────────────────────────────

  // Move Section Up/Down
  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const movingSection = sections[index];

    // Calculate new surrounding sections
    let previousSectionId: string | undefined = undefined;
    let nextSectionId: string | undefined = undefined;

    if (direction === "up") {
      // It is moving before targetIdx (swapping places)
      // New previous section is targetIdx - 1
      previousSectionId = targetIdx > 0 ? sections[targetIdx - 1].id : undefined;
      nextSectionId = sections[targetIdx].id;
    } else {
      // Moving down: after targetIdx
      previousSectionId = sections[targetIdx].id;
      nextSectionId = targetIdx < sections.length - 1 ? sections[targetIdx + 1].id : undefined;
    }

    if (!movingSection.id) return;

    setActionLoading(true);
    try {
      await CourseApi.moveSection(courseId, movingSection.id, {
        previousSectionId,
        nextSectionId,
      });
      onSuccess();
    } catch (err: any) {
      console.error("Failed to move section:", err);
      setError(err?.message || "Failed to adjust section order index.");
    } finally {
      setActionLoading(false);
    }
  };

  // Move Lesson Up/Down inside a section
  const handleMoveLesson = async (sectionId: string, lessons: LessonResponse[], index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === lessons.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const movingLesson = lessons[index];

    let previousLessonId: string | undefined = undefined;
    let nextLessonId: string | undefined = undefined;

    if (direction === "up") {
      previousLessonId = targetIdx > 0 ? lessons[targetIdx - 1].id : undefined;
      nextLessonId = lessons[targetIdx].id;
    } else {
      previousLessonId = lessons[targetIdx].id;
      nextLessonId = targetIdx < lessons.length - 1 ? lessons[targetIdx + 1].id : undefined;
    }

    if (!movingLesson.id) return;

    setActionLoading(true);
    try {
      await CourseApi.moveLesson(courseId, movingLesson.id, {
        targetSectionId: sectionId,
        previousLessonId,
        nextLessonId,
      });
      onSuccess();
    } catch (err: any) {
      console.error("Failed to move lesson:", err);
      setError(err?.message || "Failed to adjust lesson order index.");
    } finally {
      setActionLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Drag and Drop Logic
  // ──────────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, type: "section" | "lesson", id: string, index: number, sectionId?: string) => {
    setDraggedItem({ type, id, index, sectionId });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetType: "section" | "lesson", targetId: string, targetIndex: number, targetSectionId?: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    // 1. Swapping Section
    if (draggedItem.type === "section" && targetType === "section") {
      if (draggedItem.index === targetIndex) return;
      const direction = targetIndex < draggedItem.index ? "up" : "down";
      await handleMoveSection(draggedItem.index, direction);
    }

    // 2. Swapping Lesson (only within same section for drag-and-drop simplicity)
    if (draggedItem.type === "lesson" && targetType === "lesson" && draggedItem.sectionId === targetSectionId) {
      if (draggedItem.index === targetIndex) return;
      const targetSection = sections.find(s => s.id === targetSectionId);
      if (!targetSection?.lessons) return;
      const direction = targetIndex < draggedItem.index ? "up" : "down";
      await handleMoveLesson(targetSectionId!, targetSection.lessons, draggedItem.index, direction);
    }

    setDraggedItem(null);
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
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Curriculum Outline</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Create educational sections and fill them with lessons. Drag rows or use arrow buttons to order curriculum blocks.
            </p>
          </div>
          <InstructorButton
            size="sm"
            icon={Plus}
            onClick={() => openSectionModal()}
            disabled={actionLoading}
            className="px-3 py-2.5 text-sm font-medium shadow-sm"
          >
            Add Section
          </InstructorButton>
        </div>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-600 animate-fade-in">
            {error}
          </div>
        )}

        {/* Sections and Lessons List */}
        {sections.length > 0 ? (
          <div className="space-y-6">
            {sections.map((section, sIdx) => {
              const secLessons = section.lessons || [];

              return (
                <div
                  key={section.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "section", section.id!, sIdx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "section", section.id!, sIdx)}
                  className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-xs hover:border-gray-200 transition-all"
                >
                  {/* Section Title Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-4 py-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="cursor-grab active:cursor-grabbing text-gray-500 p-1 rounded-md hover:bg-gray-100/50">
                        <Move className="size-4 shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Section {sIdx + 1}: {section.title}
                        </h3>
                        {section.description && (
                          <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-2xl">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveSection(sIdx, "up")}
                        disabled={sIdx === 0 || actionLoading}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 rounded-md cursor-pointer transition-colors"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSection(sIdx, "down")}
                        disabled={sIdx === sections.length - 1 || actionLoading}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 rounded-md cursor-pointer transition-colors"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                      <button
                        onClick={() => openSectionModal(section)}
                        className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50/50 rounded-md cursor-pointer transition-colors"
                        title="Edit Section"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => section.id && handleDeleteSection(section.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="size-4" />
                      </button>
                      <div className="mx-1 h-4 w-px bg-gray-200" />
                      <InstructorButton
                        size="sm"
                        variant="secondary"
                        icon={Plus}
                        onClick={() => section.id && openLessonModal(section.id)}
                        disabled={actionLoading}
                        className="px-3 py-2.5 text-sm font-medium"
                      >
                        Add Lesson
                      </InstructorButton>
                    </div>
                  </div>

                  {/* Lessons list inside Section */}
                  <div className="space-y-2 px-3 py-3">
                    {secLessons.length > 0 ? (
                      secLessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, "lesson", lesson.id!, lIdx, section.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, "lesson", lesson.id!, lIdx, section.id)}
                          className="group flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50/50"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="cursor-grab active:cursor-grabbing text-gray-350 p-1 rounded hover:bg-gray-100 group-hover:text-gray-400 transition-colors">
                              <Move className="size-4 shrink-0" />
                            </div>
                            <div className="flex items-center space-x-2">
                              {getLessonIcon(lesson.lessonType)}
                              <span className="text-sm font-medium text-gray-900">
                                {lesson.title}
                              </span>
                            </div>
                            {lesson.isPreview && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold select-none border border-emerald-100">
                                Preview
                              </span>
                            )}
                            {lesson.duration && (
                              <span className="text-[10px] text-gray-700 font-bold bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 select-none">
                                {lesson.duration}m
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => section.id && handleMoveLesson(section.id, secLessons, lIdx, "up")}
                              disabled={lIdx === 0 || actionLoading}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ChevronUp className="size-4" />
                            </button>
                            <button
                              onClick={() => section.id && handleMoveLesson(section.id, secLessons, lIdx, "down")}
                              disabled={lIdx === secLessons.length - 1 || actionLoading}
                              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 rounded cursor-pointer"
                            >
                              <ChevronDown className="size-4" />
                            </button>
                            <button
                              onClick={() => section.id && openLessonModal(section.id, lesson)}
                              className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50/50 rounded cursor-pointer"
                              title="Edit Lesson Settings"
                            >
                              <Edit2 className="size-4" />
                            </button>
                            <button
                              onClick={() => section.id && lesson.id && handleDeleteLesson(section.id, lesson.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete Lesson"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-5 text-center text-gray-400 text-xs font-medium select-none bg-gray-50/10 border border-dashed border-gray-200 rounded-lg">
                        No lessons yet. Click &quot;Add Lesson&quot; to begin.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50/50 rounded-lg border border-gray-200">
            <Clipboard className="size-8 text-gray-300 mb-2" />
            <p className="text-xs font-semibold text-gray-600">Curriculum is currently empty</p>
            <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed font-medium">
              Add sections and fill them with videos, articles, quizzes, or assignments.
            </p>
            <InstructorButton
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => openSectionModal()}
              className="mt-4 shadow-xs"
            >
              Add Your First Section
            </InstructorButton>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4">
        <InstructorButton variant="outline" icon={ArrowLeft} onClick={onBack} className="px-3 py-2.5 text-sm font-medium">
          Back
        </InstructorButton>
        <InstructorButton
          icon={ArrowRight}
          iconPosition="right"
          onClick={onNext}
          disabled={sections.length === 0 || sections.every((s) => !s.lessons || s.lessons.length === 0)}
          className="px-3 py-2.5 text-sm font-medium"
        >
          Save & Next
        </InstructorButton>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* Dialog Modals */}
      {/* ────────────────────────────────────────────────────────────── */}

      {/* 1. Section Dialog */}
      <InstructorDialog
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title={editingSection ? "Edit Section Metadata" : "Create New Section"}
        description="Sections represent main topics or chapters of your curriculum course."
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <Input
            id="sectionTitle"
            label="Section Title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="e.g. Introduction to Routing"
            required
          />
          <InstructorTextarea
            id="sectionDesc"
            label="Section Summary (optional)"
            value={sectionDesc}
            onChange={(e) => setSectionDesc(e.target.value)}
            placeholder="Brief explanation of what chapters/topics this section covers..."
            rows={3}
          />
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setSectionModalOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
            >
              Cancel
            </button>
            <InstructorButton type="submit" loading={actionLoading} className="px-3 py-2.5 text-sm font-medium">
              Save Section
            </InstructorButton>
          </div>
        </form>
      </InstructorDialog>

      {/* 2. Lesson Dialog */}
      <InstructorDialog
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        title={editingLesson ? "Edit Lesson Configuration" : "Add Lesson Unit"}
        description="Lessons are the core content delivery blocks for students."
      >
        <form onSubmit={handleSaveLesson} className="space-y-4">
          <Input
            id="lessonTitle"
            label="Lesson Title"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="e.g. Dynamic Routing and Parameters"
            required
          />

          {!editingLesson && (
            <Select
              id="lessonType"
              label="Lesson Type"
              options={[
                { label: "📽️ Video (Uploaded mp4/mov video files)", value: "VIDEO" },
                { label: "📄 Article (Text page documents)", value: "ARTICLE" },
                { label: "📝 Quiz (Interactive test questions)", value: "QUIZ" },
                { label: "💼 Assignment (Hand-in project tasks)", value: "ASSIGNMENT" },
              ]}
              value={lessonType}
              onValueChange={(value) => setLessonType(value as typeof lessonType)}
              className="w-full max-w-full"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="lessonDuration"
              label="Duration (minutes - optional)"
              type="number"
              value={lessonDuration || ""}
              onChange={(e) => setLessonDuration(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 15"
            />

            <div className="mt-5 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <InstructorSwitch
                checked={isPreview}
                onChange={setIsPreview}
                label="Free Preview Unit"
                description="Allow non-enrolled users to view."
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setLessonModalOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
            >
              Cancel
            </button>
            <InstructorButton type="submit" loading={actionLoading} className="px-3 py-2.5 text-sm font-medium">
              Save Lesson
            </InstructorButton>
          </div>
        </form>
      </InstructorDialog>
    </div>
  );
}
