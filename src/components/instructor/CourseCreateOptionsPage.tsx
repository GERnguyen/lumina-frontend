"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileQuestion,
  FileText,
  GripVertical,
  ImageIcon,
  Layers,
  ListChecks,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { InstructorFooter } from "@/components/instructor/InstructorDashboardWidgets";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorTopbar } from "@/components/instructor/InstructorTopbar";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  ArticleLessonService,
  AssignmentLessonService,
  CourseImageService,
  CourseService,
  CourseUploadService,
  LessonService,
  QuizLessonService,
  QuizQuestionService,
  SectionService,
  VideoQuestionService,
  VideoLessonService,
} from "@/services/courseService";

type LessonType = "VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT";
type StepId = "basics" | "pricing" | "curriculum" | "content" | "media" | "review";
type QuizQuestionType = "SINGLE_CHOICE" | "MULTI_CHOICE" | "SHORT_TEXT" | "ORDERING" | "MATCHING";
type QuizScoringMethod = "ALL_OR_NOTHING" | "PARTIAL_CREDIT" | "NEGATIVE_MARK";

type Lesson = {
  id: string;
  serverId?: string;
  title: string;
  type: LessonType;
  duration: number;
  preview?: boolean;
  locked?: boolean;
  content?: LessonContent;
};

type Section = {
  id: string;
  serverId?: string;
  title: string;
  description: string;
  duration: number;
  lessons: Lesson[];
};

type CourseImage = {
  id: string;
  fileKey: string;
  file?: File;
  name: string;
  size: string;
  url: string;
  isCover: boolean;
  uploaded?: boolean;
};

type CourseBasics = {
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: string;
  discountedPrice: string;
  durationLabel: string;
  isInSubscription: boolean;
  hasCertificate: boolean;
  certificateTitle: string;
};

type LessonContent = {
  videoFile?: File;
  videoFileKey?: string;
  videoUrl?: string;
  videoFileName?: string;
  videoFileSize?: string;
  videoFileType?: string;
  videoDescription?: string;
  videoQuestions?: VideoCheckpointQuestion[];
  articleFile?: File;
  articleFileKey?: string;
  articleUrl?: string;
  articleFileName?: string;
  articleFileSize?: number;
  articleFileType?: string;
  quizQuestions?: QuizQuestion[];
  questionsPerAttempt?: number;
  passingScore?: number;
  assignmentInstructions?: string;
  assignmentDueDays?: number;
  assignmentAttachmentFile?: File;
  assignmentAttachmentFileKey?: string;
  assignmentAttachmentUrl?: string;
  assignmentAttachment?: string;
  assignmentAttachmentType?: string;
  assignmentAttachmentSize?: number;
};

type QuizQuestion = {
  id: string;
  serverId?: string;
  prompt: string;
  questionType: QuizQuestionType;
  scoringMethod: QuizScoringMethod;
  options: Array<{
    id: string;
    serverId?: string;
    text: string;
    isCorrect: boolean;
    order: number;
    matchText?: string;
  }>;
};

type VideoCheckpointQuestion = {
  id: string;
  serverId?: string;
  prompt: string;
  questionType: "SINGLE_CHOICE" | "MULTI_CHOICE";
  timestampSeconds: number;
  options: Array<{
    id: string;
    serverId?: string;
    text: string;
    isCorrect: boolean;
  }>;
};

const shellUser = {
  name: "Lumina Instructor",
  email: "instructor@lumina.dev",
  avatar: "https://ui-avatars.com/api/?name=Lumina%20Instructor&background=EBEBFF&color=564FFD&bold=true",
  role: "INSTRUCTOR" as const,
};

const steps: Array<{
  id: StepId;
  label: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  { id: "basics", label: "Basics", description: "Course identity", icon: BookOpen },
  { id: "pricing", label: "Pricing", description: "Price and access", icon: BadgeCheck },
  { id: "curriculum", label: "Curriculum", description: "Sections and lessons", icon: Layers },
  { id: "content", label: "Lesson Content", description: "Learning materials", icon: PlayCircle },
  { id: "media", label: "Media", description: "Images and cover", icon: ImageIcon },
  { id: "review", label: "Review", description: "Final checklist", icon: ListChecks },
];

const lessonTypeMeta: Record<LessonType, { label: string; icon: typeof Video; tone: string; description: string }> = {
  VIDEO: {
    label: "Video",
    icon: Video,
    tone: "bg-[#EBEBFF] text-[#564FFD]",
    description: "Upload a lecture video",
  },
  ARTICLE: {
    label: "Article",
    icon: FileText,
    tone: "bg-[#E6F0FF] text-[#0066FF]",
    description: "Write a rich text lesson",
  },
  QUIZ: {
    label: "Quiz",
    icon: FileQuestion,
    tone: "bg-[#FFF2E5] text-[#FD8E1F]",
    description: "Create graded questions",
  },
  ASSIGNMENT: {
    label: "Assignment",
    icon: ClipboardCheck,
    tone: "bg-[#E1F7E3] text-[#23BD33]",
    description: "Collect learner submissions",
  },
};

const initialSections: Section[] = [
  {
    id: "section-1",
    title: "Foundations",
    description: "Set up the project, explain prerequisites, and align expectations.",
    duration: 24,
    lessons: [
      { id: "lesson-1", title: "Course welcome and setup", type: "VIDEO", duration: 8, preview: true },
      { id: "lesson-2", title: "Development environment checklist", type: "ARTICLE", duration: 6 },
      { id: "lesson-3", title: "Readiness quiz", type: "QUIZ", duration: 10 },
    ],
  },
  {
    id: "section-2",
    title: "Core Project",
    description: "Guide learners through the implementation milestones.",
    duration: 63,
    lessons: [
      { id: "lesson-4", title: "Integration walkthrough", type: "VIDEO", duration: 18, locked: true },
      { id: "lesson-5", title: "Build the feature slice", type: "ASSIGNMENT", duration: 45 },
    ],
  },
  {
    id: "section-3",
    title: "Production Polish",
    description: "Review deployment, edge cases, and final submission expectations.",
    duration: 28,
    lessons: [
      { id: "lesson-6", title: "Performance and UX review", type: "VIDEO", duration: 16 },
      { id: "lesson-7", title: "Final knowledge check", type: "QUIZ", duration: 12 },
    ],
  },
];

const defaultCourseBasics: CourseBasics = {
  title: "Full-stack React Course",
  categoryId: "2fc96189-324b-4664-98b1-6c05decd3213",
  categoryName: "Software Development",
  description: "Build a production-ready React application with authenticated features, structured UI, and deployable workflows.",
  price: "799000",
  discountedPrice: "599000",
  durationLabel: "9h 40m",
  isInSubscription: false,
  hasCertificate: true,
  certificateTitle: "Full-stack React Completion Certificate",
};

function moveItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function minutesLabel(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function TextField({ label, value, helper, wide }: { label: string; value: string; helper?: string; wide?: boolean }) {
  return (
    <label className={cn("block", wide && "md:col-span-2")}>
      <span className="text-sm font-medium text-[#4E5566]">{label}</span>
      <input
        value={value}
        readOnly
        className="mt-2 h-12 w-full rounded-[14px] border border-[#E9EAF0] bg-white px-4 text-sm text-[#1D2026] transition focus:border-[#564FFD] focus:ring-0"
      />
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#8C94A3]">{helper}</span> : null}
    </label>
  );
}

function EditableField({
  label,
  value,
  onChange,
  helper,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#4E5566]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="mt-2 w-full resize-none rounded-[14px] border border-[#E9EAF0] bg-white px-4 py-3 text-sm leading-6 text-[#1D2026] transition focus:border-[#564FFD] focus:ring-0"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 h-12 w-full rounded-[14px] border border-[#E9EAF0] bg-white px-4 text-sm text-[#1D2026] transition focus:border-[#564FFD] focus:ring-0"
        />
      )}
      {helper ? <span className="mt-2 block text-xs leading-5 text-[#8C94A3]">{helper}</span> : null}
    </label>
  );
}

function ToggleRow({ title, copy, active = true }: { title: string; copy: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[#E9EAF0] bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-[#1D2026]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#8C94A3]">{copy}</p>
      </div>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition", active ? "bg-[#564FFD]" : "bg-[#CED1D9]")}>
        <span className={cn("absolute top-1 size-5 rounded-full bg-white transition", active ? "left-6" : "left-1")} />
      </span>
    </div>
  );
}

function WizardRail({ activeStep, setActiveStep }: { activeStep: StepId; setActiveStep: (step: StepId) => void }) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <nav className="rounded-[18px] bg-white p-4">
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center">
        <div className="flex min-w-[220px] items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-[16px] bg-[#EBEBFF] text-[#564FFD]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold text-[#1D2026]">Course setup</h2>
          <p className="text-xs text-[#8C94A3]">Build a publish-ready course</p>
        </div>
      </div>

        <div className="grid flex-1 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          const isDone = index < activeIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={cn(
                  "flex min-h-[76px] w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition",
                isActive ? "bg-[#564FFD] text-white shadow-[0_12px_26px_rgba(86,79,253,0.22)]" : "bg-[#F8F8FF] text-[#6E7485] hover:bg-[#EBEBFF] hover:text-[#1D2026]",
              )}
            >
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", isActive ? "bg-white/15" : isDone ? "bg-[#E1F7E3] text-[#23BD33]" : "bg-white text-[#564FFD]")}>
                {isDone ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{step.label}</span>
                <span className={cn("mt-0.5 block truncate text-xs", isActive ? "text-white/70" : "text-[#8C94A3]")}>{step.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      </div>
    </nav>
  );
}

function DraggableCurriculum({
  sections,
  setSections,
  selectedSectionId,
  setSelectedSectionId,
  selectedLessonId,
  setSelectedLessonId,
}: {
  sections: Section[];
  setSections: (sections: Section[]) => void;
  selectedSectionId?: string;
  setSelectedSectionId: (sectionId: string) => void;
  selectedLessonId?: string;
  setSelectedLessonId: (lessonId: string) => void;
}) {
  const [dragged, setDragged] = useState<{ sectionIndex: number; lessonIndex?: number } | undefined>();

  function moveSection(targetIndex: number) {
    if (!dragged || dragged.lessonIndex !== undefined || dragged.sectionIndex === targetIndex) return;
    setSections(moveItem(sections, dragged.sectionIndex, targetIndex));
    setDragged(undefined);
  }

  function moveLesson(targetSectionIndex: number, targetLessonIndex: number) {
    if (!dragged || dragged.lessonIndex === undefined) return;
    const next = sections.map((section) => ({ ...section, lessons: [...section.lessons] }));
    const [lesson] = next[dragged.sectionIndex].lessons.splice(dragged.lessonIndex, 1);
    next[targetSectionIndex].lessons.splice(targetLessonIndex, 0, lesson);
    setSections(next);
    setDragged(undefined);
  }

  function deleteLesson(sectionId: string, lessonId: string) {
    const section = sections.find((item) => item.id === sectionId);
    if (!section) return;

    const lessonIndex = section.lessons.findIndex((item) => item.id === lessonId);
    const deletedLesson = section.lessons[lessonIndex];
    const nextSections = sections.map((item) =>
      item.id === sectionId
        ? {
            ...item,
            duration: Math.max(0, item.duration - (deletedLesson?.duration || 0)),
            lessons: item.lessons.filter((lesson) => lesson.id !== lessonId),
          }
        : item,
    );

    if (selectedLessonId === lessonId) {
      const nextSection = nextSections.find((item) => item.id === sectionId);
      const nextLesson =
        nextSection?.lessons[Math.min(lessonIndex, Math.max(0, nextSection.lessons.length - 1))] ||
        nextSections.flatMap((item) => item.lessons)[0];

      setSelectedLessonId(nextLesson?.id || "");
      if (nextLesson) {
        const nextLessonSection = nextSections.find((item) => item.lessons.some((lesson) => lesson.id === nextLesson.id));
        setSelectedSectionId(nextLessonSection?.id || sectionId);
      }
    }

    setSections(nextSections);
  }

  function deleteSection(sectionId: string) {
    const sectionIndex = sections.findIndex((item) => item.id === sectionId);
    if (sectionIndex < 0) return;

    const nextSections = sections.filter((item) => item.id !== sectionId);
    const nextSelectedSection = nextSections[Math.max(0, sectionIndex - 1)] || nextSections[0];
    const selectedLessonWasInside = sections[sectionIndex]?.lessons.some((lesson) => lesson.id === selectedLessonId);
    const nextSelectedLesson =
      nextSelectedSection?.lessons[0] ||
      nextSections.flatMap((item) => item.lessons)[0];

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(nextSelectedSection?.id || "");
    }

    if (selectedLessonWasInside) {
      setSelectedLessonId(nextSelectedLesson?.id || "");
      if (nextSelectedLesson) {
        const nextLessonSection = nextSections.find((item) => item.lessons.some((lesson) => lesson.id === nextSelectedLesson.id));
        setSelectedSectionId(nextLessonSection?.id || nextSelectedSection?.id || "");
      }
    }

    setSections(nextSections);
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => (
        <section
          key={section.id}
          draggable
          onDragStart={() => setDragged({ sectionIndex })}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => moveSection(sectionIndex)}
          className={cn(
            "rounded-[18px] border bg-white transition hover:border-[#D8D6FF]",
            selectedSectionId === section.id ? "border-[#564FFD] shadow-[0_16px_34px_rgba(86,79,253,0.10)]" : "border-[#E9EAF0]",
          )}
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => setSelectedSectionId(section.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedSectionId(section.id);
              }
            }}
            className="flex w-full items-start gap-3 border-b border-[#E9EAF0] p-4 text-left"
          >
            <span aria-label="Drag section" className="mt-1 text-[#8C94A3]">
              <GripVertical className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-[#1D2026]">{section.title}</h3>
                <span className="rounded-full bg-[#F5F7FA] px-2 py-0.5 text-xs text-[#6E7485]">
                  {section.lessons.length} lessons
                </span>
                <span className="rounded-full bg-[#EBEBFF] px-2 py-0.5 text-xs text-[#564FFD]">
                  {minutesLabel(section.duration)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-[#6E7485]">{section.description}</p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-[12px] bg-[#F5F7FA] text-[#4E5566]">
              <ChevronDown className="size-4" />
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                deleteSection(section.id);
              }}
              onDragStart={(event) => event.stopPropagation()}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-[12px] text-[#A1A5B3] transition hover:bg-[#FFF5F0] hover:text-[#E34444]"
              aria-label={`Delete ${section.title}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="space-y-2 p-3">
            {section.lessons.map((lesson, lessonIndex) => {
              const meta = lessonTypeMeta[lesson.type];
              const Icon = meta.icon;
              const isSelected = selectedLessonId === lesson.id;

              return (
                <article
                  key={lesson.id}
                  draggable
                  onClick={() => {
                    setSelectedSectionId(section.id);
                    setSelectedLessonId(lesson.id);
                  }}
                  onDragStart={(event) => {
                    event.stopPropagation();
                    setDragged({ sectionIndex, lessonIndex });
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.stopPropagation();
                    moveLesson(sectionIndex, lessonIndex);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-[14px] border px-3 py-3 transition",
                    isSelected ? "border-[#564FFD] bg-[#F8F8FF]" : "border-transparent bg-[#F8F8FF] hover:border-[#D8D6FF] hover:bg-white",
                  )}
                >
                  <GripVertical className="size-4 shrink-0 text-[#A1A5B3]" />
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[12px]", meta.tone)}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1D2026]">{lesson.title}</p>
                    <p className="mt-0.5 text-xs text-[#8C94A3]">{meta.label} · {minutesLabel(lesson.duration)}</p>
                  </div>
                  {lesson.locked ? <Lock className="size-4 text-[#8C94A3]" /> : null}
                  {lesson.preview ? (
                    <span className="rounded-full bg-[#E1F7E3] px-2 py-1 text-xs font-medium text-[#23BD33]">Preview</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteLesson(section.id, lesson.id);
                    }}
                    onDragStart={(event) => event.stopPropagation()}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-[12px] text-[#A1A5B3] transition hover:bg-[#FFF5F0] hover:text-[#E34444]"
                    aria-label={`Delete ${lesson.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function BasicsStep({ basics, setBasics }: { basics: CourseBasics; setBasics: (basics: CourseBasics) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <EditableField label="Course title" value={basics.title} onChange={(title) => setBasics({ ...basics, title })} helper="Make it specific and easy to search." />
      <EditableField label="Category" value={basics.categoryName} onChange={(categoryName) => setBasics({ ...basics, categoryName })} helper="Currently mapped to Software Development." />
      <EditableField label="Estimated duration" value={basics.durationLabel} onChange={(durationLabel) => setBasics({ ...basics, durationLabel })} helper="This preview is recalculated from lessons when saving." />
      <div className="md:col-span-2">
        <EditableField
          label="Course description"
          value={basics.description}
          onChange={(description) => setBasics({ ...basics, description })}
          multiline
        />
      </div>
    </div>
  );
}

function PricingStep({ basics, setBasics }: { basics: CourseBasics; setBasics: (basics: CourseBasics) => void }) {
  const price = Number(basics.price) || 0;
  const discountedPrice = Number(basics.discountedPrice) || price;
  const discountRate = price > 0 ? Math.max(0, Math.round(((price - discountedPrice) / price) * 100)) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid gap-4 md:grid-cols-2">
        <EditableField label="Base price" value={basics.price} onChange={(value) => setBasics({ ...basics, price: value })} helper="The original listed price." />
        <EditableField label="Discounted price" value={basics.discountedPrice} onChange={(value) => setBasics({ ...basics, discountedPrice: value })} helper="The current price learners will see." />
        <button type="button" className="text-left" onClick={() => setBasics({ ...basics, isInSubscription: !basics.isInSubscription })}>
          <ToggleRow title="Included in subscription" copy="Allow learners with a subscription to access this course." active={basics.isInSubscription} />
        </button>
        <button type="button" className="text-left" onClick={() => setBasics({ ...basics, hasCertificate: !basics.hasCertificate })}>
          <ToggleRow title="Certificate enabled" copy="Give learners a certificate after completion." active={basics.hasCertificate} />
        </button>
        <EditableField label="Certificate title" value={basics.certificateTitle} onChange={(certificateTitle) => setBasics({ ...basics, certificateTitle })} />
      </div>

      <aside className="rounded-[18px] bg-[#111033] p-5 text-white">
        <p className="text-sm text-white/65">Pricing preview</p>
        <strong className="mt-2 block text-3xl">{new Intl.NumberFormat("en-US").format(discountedPrice)} VND</strong>
        <p className="mt-2 text-sm text-white/65">{discountRate}% discount from base price.</p>
        <div className="mt-6 space-y-3">
          {["Learner sees discounted price", "Course revenue appears in Earning", "Enrollment is created after paid order"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-white/75">
              <CheckCircle2 className="size-4 text-[#23BD33]" />
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function CurriculumStep({
  sections,
  setSections,
  selectedSectionId,
  setSelectedSectionId,
  selectedLessonId,
  setSelectedLessonId,
}: {
  sections: Section[];
  setSections: (sections: Section[]) => void;
  selectedSectionId?: string;
  setSelectedSectionId: (sectionId: string) => void;
  selectedLessonId?: string;
  setSelectedLessonId: (lessonId: string) => void;
}) {
  const selectedSection = sections.find((section) => section.id === selectedSectionId) || sections[0];

  function patchSelectedSection(patch: Partial<Section>) {
    if (!selectedSection) return;
    setSections(sections.map((section) => (section.id === selectedSection.id ? { ...section, ...patch } : section)));
  }

  function addSection() {
    const id = `section-${Date.now()}`;
    const nextSection: Section = {
      id,
      title: `New section ${sections.length + 1}`,
      description: "Describe what learners will complete in this section.",
      duration: 0,
      lessons: [],
    };
    setSections([...sections, nextSection]);
    setSelectedSectionId(id);
  }

  function deleteSelectedSection() {
    if (!selectedSection) return;

    const sectionIndex = sections.findIndex((section) => section.id === selectedSection.id);
    const nextSections = sections.filter((section) => section.id !== selectedSection.id);
    const nextSelectedSection = nextSections[Math.max(0, sectionIndex - 1)] || nextSections[0];
    const nextSelectedLesson = nextSelectedSection?.lessons[0] || nextSections.flatMap((section) => section.lessons)[0];

    setSections(nextSections);
    setSelectedSectionId(nextSelectedSection?.id || "");
    setSelectedLessonId(nextSelectedLesson?.id || "");
  }

  function addLesson(type: LessonType) {
    if (!selectedSection) return;
    const id = `lesson-${Date.now()}`;
    const lesson: Lesson = {
      id,
      title: `New ${lessonTypeMeta[type].label.toLowerCase()} lesson`,
      type,
      duration: type === "ASSIGNMENT" ? 45 : 10,
      preview: false,
    };
    setSections(
      sections.map((section) =>
        section.id === selectedSection.id
          ? {
              ...section,
              duration: section.duration + lesson.duration,
              lessons: [...section.lessons, lesson],
            }
          : section,
      ),
    );
    setSelectedLessonId(id);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <DraggableCurriculum
        sections={sections}
        setSections={setSections}
        selectedSectionId={selectedSection?.id}
        setSelectedSectionId={setSelectedSectionId}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
      />

      <aside className="space-y-4">
        <button type="button" onClick={addSection} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] text-sm font-semibold text-white">
          <Plus className="size-4" />
          Add section
        </button>

        {selectedSection ? (
          <div className="rounded-[18px] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-[#1D2026]">Edit selected section</h3>
              <button
                type="button"
                onClick={deleteSelectedSection}
                className="inline-flex size-10 items-center justify-center rounded-[14px] border border-[#FFE0D4] bg-[#FFF5F0] text-[#E34444] transition hover:border-[#E34444] hover:bg-[#FFEAE3]"
                aria-label="Delete selected section"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <EditableField
                label="Section title"
                value={selectedSection.title}
                onChange={(title) => patchSelectedSection({ title })}
                helper="Keep section titles short and outcome-focused."
              />
              <EditableField
                label="Description"
                value={selectedSection.description}
                onChange={(description) => patchSelectedSection({ description })}
                helper="Optional section context for learners"
                multiline
              />
              <EditableField
                label="Duration minutes"
                value={String(selectedSection.duration)}
                onChange={(duration) => patchSelectedSection({ duration: Number(duration) || 0 })}
              />
            </div>
          </div>
        ) : null}

        <div className="rounded-[18px] bg-white p-5">
          <h3 className="font-semibold text-[#1D2026]">Add lesson to section</h3>
          <p className="mt-1 text-sm leading-6 text-[#6E7485]">Choose a lesson type. The next step will expose its content editor.</p>
          <div className="mt-4 grid gap-3">
            {(Object.keys(lessonTypeMeta) as LessonType[]).map((type) => {
              const meta = lessonTypeMeta[type];
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addLesson(type)}
                  className="flex items-center gap-3 rounded-[14px] border border-[#E9EAF0] bg-white p-3 text-left transition hover:border-[#D8D6FF] hover:bg-[#F8F8FF]"
                >
                  <span className={cn("flex size-10 items-center justify-center rounded-[14px]", meta.tone)}>
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#1D2026]">{meta.label}</span>
                    <span className="text-xs text-[#8C94A3]">{meta.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[18px] bg-white p-5">
          <h3 className="font-semibold text-[#1D2026]">Organize the flow</h3>
          <p className="mt-2 text-sm leading-6 text-[#6E7485]">
            Drag sections and lessons into the order learners should follow.
          </p>
        </div>
      </aside>
    </div>
  );
}

function createQuizOption(text: string, index: number, isCorrect = false, matchText?: string) {
  return {
    id: `option-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    text,
    isCorrect,
    order: index,
    matchText,
  };
}

function createDefaultQuizOptions(type: QuizQuestionType): QuizQuestion["options"] {
  if (type === "SHORT_TEXT") return [createQuizOption("Accepted answer", 0, true)];
  if (type === "MATCHING") {
    return [
      createQuizOption("Concept A", 0, true, "Definition A"),
      createQuizOption("Concept B", 1, true, "Definition B"),
    ];
  }
  if (type === "ORDERING") {
    return [
      createQuizOption("First step", 0, true),
      createQuizOption("Second step", 1, true),
      createQuizOption("Third step", 2, true),
    ];
  }
  return [
    createQuizOption("Correct option", 0, true),
    createQuizOption("Distractor option", 1),
    createQuizOption("Another distractor", 2),
    createQuizOption("Last distractor", 3),
  ];
}

function createQuizQuestion(type: QuizQuestionType = "SINGLE_CHOICE"): QuizQuestion {
  return {
    id: `question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    prompt: "New quiz question",
    questionType: type,
    scoringMethod: type === "MULTI_CHOICE" ? "PARTIAL_CREDIT" : "ALL_OR_NOTHING",
    options: createDefaultQuizOptions(type),
  };
}

const defaultQuizQuestions: QuizQuestion[] = [
  {
    ...createQuizQuestion("SINGLE_CHOICE"),
    id: "question-1",
    prompt: "What is the main outcome learners should achieve in this lesson?",
    options: [
      createQuizOption("Understand the concept", 0, true),
      createQuizOption("Skip the practice", 1),
      createQuizOption("Disable validation", 2),
      createQuizOption("Ignore the learning goal", 3),
    ],
  },
];

function createVideoCheckpointOption(text: string, index: number, isCorrect = false): VideoCheckpointQuestion["options"][number] {
  return {
    id: `video-option-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    text,
    isCorrect,
  };
}

function createVideoCheckpointQuestion(): VideoCheckpointQuestion {
  return {
    id: `video-question-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    prompt: "New video checkpoint question",
    questionType: "SINGLE_CHOICE",
    timestampSeconds: 30,
    options: [
      createVideoCheckpointOption("Correct answer", 0, true),
      createVideoCheckpointOption("Wrong answer", 1),
    ],
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function draftFileKey(scope: string, name: string) {
  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  return `draft/${scope}/${Date.now()}-${cleanName}`;
}

function parseSizeLabel(size: string | undefined) {
  if (!size) return 0;
  const value = Number.parseFloat(size);
  if (Number.isNaN(value)) return 0;
  if (size.toLowerCase().includes("mb")) return Math.round(value * 1024 * 1024);
  return Math.round(value * 1024);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getApiData<T>(response: { data?: T }, fallbackMessage: string): T {
  if (!response.data) throw new Error(fallbackMessage);
  return response.data;
}

async function safeApiCall<T>(call: () => Promise<T>): Promise<T | undefined> {
  try {
    return await call();
  } catch {
    return undefined;
  }
}

function createCourseDraftPayload(sections: Section[], basics: CourseBasics) {
  return {
    title: basics.title,
    description: basics.description,
    categoryId: basics.categoryId,
    price: Number(basics.price) || 0,
    discountedPrice: Number(basics.discountedPrice) || undefined,
    isInSubscription: basics.isInSubscription,
    duration: sections.reduce((sum, section) => sum + section.duration, 0),
    hasCertificate: basics.hasCertificate,
    certificateTitle: basics.hasCertificate ? basics.certificateTitle : undefined,
  };
}

function isNotFoundError(error: unknown) {
  const maybeError = error as { response?: { status?: number }; status?: number };
  return maybeError?.response?.status === 404 || maybeError?.status === 404;
}

function hasMeaningfulLessonContent(lesson: Lesson) {
  const content = lesson.content;
  if (!content) return false;
  if (lesson.type === "VIDEO") return Boolean(content.videoFile || content.videoFileKey || content.videoQuestions?.length);
  if (lesson.type === "ARTICLE") return Boolean(content.articleFile || content.articleFileKey);
  if (lesson.type === "QUIZ") return Boolean(content.quizQuestions?.length);
  return Boolean(content.assignmentInstructions?.trim() || content.assignmentAttachmentFile || content.assignmentAttachmentFileKey);
}

async function syncDeletedCurriculumItems(courseId: string, sections: Section[]) {
  const currentSectionIds = new Set(sections.map((section) => section.serverId).filter(Boolean));
  const currentLessonIds = new Set(sections.flatMap((section) => section.lessons.map((lesson) => lesson.serverId)).filter(Boolean));
  const response = await CourseService.getEditableDraftCurriculum({ id: courseId }).catch(() => undefined);
  const serverSections = response?.data?.sections || [];

  for (const serverSection of serverSections) {
    if (!serverSection.id) continue;
    if (!currentSectionIds.has(serverSection.id)) {
      await SectionService.deleteSection({ courseId, sectionId: serverSection.id });
      continue;
    }

    for (const serverLesson of serverSection.lessons || []) {
      if (serverLesson.id && !currentLessonIds.has(serverLesson.id)) {
        await LessonService.deleteLesson({
          courseId,
          sectionId: serverSection.id,
          lessonId: serverLesson.id,
        });
      }
    }
  }
}

async function uploadFileWithPresignedUrl(file: File) {
  try {
    const contentType = file.type || "application/octet-stream";
    const response = await CourseUploadService.getPresignedUrl({
      fileName: file.name,
      contentType,
    });

    const presignedUrl = response.data?.presignedUrl;
    const fileKey = response.data?.fileKey;

    if (!presignedUrl || !fileKey) {
      throw new Error(response.message || "Could not prepare course media upload.");
    }

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": contentType,
        "x-amz-acl": "public-read",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Could not upload course media. Storage returned ${uploadResponse.status}.`);
    }

    return fileKey;
  } catch (error) {
    throw new Error(`Could not upload "${file.name}". ${getErrorMessage(error, "Please check upload settings.")}`);
  }
}

function normalizeVideoCheckpointQuestion(question: VideoCheckpointQuestion) {
  const options = question.options.length ? question.options : [
    createVideoCheckpointOption("Correct answer", 0, true),
    createVideoCheckpointOption("Wrong answer", 1),
  ];
  const normalizedOptions = options.map((option) => ({
    id: option.serverId,
    optionText: option.text || "Option",
    isCorrect: Boolean(option.isCorrect),
  }));

  if (question.questionType === "SINGLE_CHOICE" && !normalizedOptions.some((option) => option.isCorrect)) {
    normalizedOptions[0].isCorrect = true;
  }

  return {
    questionText: question.prompt || "Video checkpoint question",
    questionType: question.questionType,
    timestampSeconds: Math.max(0, Number(question.timestampSeconds) || 0),
    options: normalizedOptions,
  };
}

function toCreateVideoCheckpointQuestionBody(question: VideoCheckpointQuestion) {
  const body = normalizeVideoCheckpointQuestion(question);
  return {
    ...body,
    options: body.options.map(({ optionText, isCorrect }) => ({ optionText, isCorrect })),
  };
}

async function syncVideoCheckpointQuestions(courseId: string, lessonId: string, questions: VideoCheckpointQuestion[]) {
  const existingResponse = await VideoQuestionService.getQuestionsByLessonId({ courseId, lessonId }).catch(() => undefined);
  const existingQuestions = existingResponse?.data || [];
  const nextServerIds = new Set(questions.map((question) => question.serverId).filter(Boolean));

  for (const existing of existingQuestions) {
    if (existing.id && !nextServerIds.has(existing.id)) {
      await VideoQuestionService.deleteQuestion({ courseId, lessonId, id: existing.id }).catch(() => undefined);
    }
  }

  for (const question of questions) {
    const body = toCreateVideoCheckpointQuestionBody(question);
    if (!question.serverId) {
      await VideoQuestionService.createQuestion({ courseId, lessonId, body });
      continue;
    }

    await VideoQuestionService.deleteQuestion({ courseId, lessonId, id: question.serverId }).catch(() => undefined);
    await VideoQuestionService.createQuestion({ courseId, lessonId, body });
  }
}

async function upsertVideoLessonContent(courseId: string, lesson: Lesson, lessonId: string, isExistingLesson: boolean) {
  const content = getLessonContent(lesson);
  let fileKey = content.videoFileKey;
  const file = content.videoFile;

  if (file) {
    fileKey = await uploadFileWithPresignedUrl(file);
  }

  if (!fileKey || !content.videoFileName) {
    if (isExistingLesson) {
      await syncVideoCheckpointQuestions(courseId, lessonId, content.videoQuestions || []);
    }
    return;
  }

  const body = {
    fileKey,
    fileName: content.videoFileName,
    fileType: content.videoFileType || file?.type || "video/mp4",
    fileSize: file?.size || parseSizeLabel(content.videoFileSize),
    duration: lesson.duration,
  };

  if (isExistingLesson) {
    try {
      await VideoLessonService.updateVideoLesson({ courseId, lessonId, body });
      await syncVideoCheckpointQuestions(courseId, lessonId, content.videoQuestions || []);
      return;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }

  await VideoLessonService.createVideoLesson({ courseId, lessonId, body });
  await syncVideoCheckpointQuestions(courseId, lessonId, content.videoQuestions || []);
}

async function upsertArticleLessonContent(courseId: string, lesson: Lesson, lessonId: string, isExistingLesson: boolean) {
  const content = getLessonContent(lesson);
  let fileKey = content.articleFileKey;
  let fileName = content.articleFileName;
  let fileSize = content.articleFileSize;
  let fileType = content.articleFileType || "application/pdf";
  const file = content.articleFile;

  if (file) {
    fileKey = await uploadFileWithPresignedUrl(file);
    fileName = file.name;
    fileSize = file.size;
    fileType = file.type || "application/pdf";
  }

  if (!fileKey || !fileName) return;

  const body = {
    fileKey,
    fileName,
    fileType,
    fileSize: fileSize || file?.size || 0,
  };

  if (isExistingLesson) {
    try {
      await ArticleLessonService.updateArticleLesson({ courseId, lessonId, body });
      return;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }

  await ArticleLessonService.createArticleLesson({ courseId, lessonId, body });
}

function normalizeQuizQuestion(question: QuizQuestion) {
  const options = question.options.length ? question.options : createDefaultQuizOptions(question.questionType);
  const normalizedOptions = options.map((option, index) => {
    const isCorrect =
      question.questionType === "ORDERING" || question.questionType === "MATCHING"
        ? true
        : option.isCorrect;

    return {
      id: option.serverId,
      optionText: option.text || `Option ${index + 1}`,
      isCorrect,
      optionOrder: index,
      matchText: question.questionType === "MATCHING" ? option.matchText || "" : undefined,
    };
  });

  if (question.questionType === "SINGLE_CHOICE" && !normalizedOptions.some((option) => option.isCorrect)) {
    normalizedOptions[0].isCorrect = true;
  }

  return {
    questionText: question.prompt || "Untitled question",
    questionType: question.questionType,
    scoringMethod: question.scoringMethod,
    options: normalizedOptions,
  };
}

async function syncExistingQuizQuestions(courseId: string, lessonId: string, questions: QuizQuestion[]) {
  const existingResponse = await QuizQuestionService.getQuestions({ courseId, lessonId }).catch(() => undefined);
  const existingQuestions = existingResponse?.data || [];
  const nextServerIds = new Set(questions.map((question) => question.serverId).filter(Boolean));

  for (const existing of existingQuestions) {
    if (existing.id && !nextServerIds.has(existing.id)) {
      await QuizQuestionService.deleteQuestion_1({ courseId, lessonId, questionId: existing.id }).catch(() => undefined);
    }
  }

  for (const question of questions) {
    const body = normalizeQuizQuestion(question);
    if (!question.serverId) {
      await QuizQuestionService.addQuestion({ courseId, lessonId, body });
      continue;
    }

    const existing = existingQuestions.find((item) => item.id === question.serverId);
    if (existing?.questionType && existing.questionType !== question.questionType) {
      await QuizQuestionService.deleteQuestion_1({ courseId, lessonId, questionId: question.serverId }).catch(() => undefined);
      await QuizQuestionService.addQuestion({ courseId, lessonId, body });
      continue;
    }

    await QuizQuestionService.updateQuestion_1({
      courseId,
      lessonId,
      questionId: question.serverId,
      body: {
        questionText: body.questionText,
        scoringMethod: body.scoringMethod,
        options: body.options,
      },
    });
  }
}

async function upsertQuizLessonContent(courseId: string, lesson: Lesson, lessonId: string, isExistingLesson: boolean) {
  const content = getLessonContent(lesson);
  const questions = content.quizQuestions?.length ? content.quizQuestions : defaultQuizQuestions;
  const questionCount = Math.max(1, questions.length);
  const questionsPerAttempt = clampNumber(Number(content.questionsPerAttempt) || questionCount, 1, questionCount);
  const settings = {
    numberOfQuestionPerQuizSession: questionsPerAttempt,
    maxAttempt: 3,
    duration: lesson.duration,
    isReviewAllowed: true,
    isShowAnswersOnReview: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    scoringMode: "HIGHEST" as const,
  };

  if (isExistingLesson) {
    try {
      await QuizLessonService.updateQuizSettings({
        courseId,
        lessonId,
        body: {
          ...settings,
          numberOfQuestionPerQuizSession: 1,
        },
      }).catch((error) => {
        if (!String(getErrorMessage(error, "")).includes("cannot exceed current question count")) throw error;
      });
      await syncExistingQuizQuestions(courseId, lessonId, questions);
      await QuizLessonService.updateQuizSettings({ courseId, lessonId, body: settings });
      await QuizLessonService.syncQuiz({
        courseId,
        lessonId,
        body: { triggerRegrade: false, changeReason: "Instructor updated quiz settings" },
      }).catch(() => undefined);
      return;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }

  await QuizLessonService.createQuizLesson({
    courseId,
    lessonId,
    body: {
      ...settings,
      questions: questions.map(normalizeQuizQuestion),
    },
  });
}

async function upsertAssignmentLessonContent(courseId: string, lesson: Lesson, lessonId: string, isExistingLesson: boolean) {
  const content = getLessonContent(lesson);
  const attachments = [];
  let fileKey = content.assignmentAttachmentFileKey;
  const file = content.assignmentAttachmentFile;

  if (file) {
    fileKey = await uploadFileWithPresignedUrl(file);
  }

  if (fileKey && content.assignmentAttachment) {
    attachments.push({
      fileKey,
      fileName: content.assignmentAttachment,
      fileType: content.assignmentAttachmentType || file?.type || "application/octet-stream",
      fileSize: content.assignmentAttachmentSize || file?.size || 0,
    });
  }

  const body = {
    description: content.assignmentInstructions || "Assignment instructions",
    ...(attachments.length ? { attachments } : {}),
  };

  if (isExistingLesson) {
    try {
      await AssignmentLessonService.updateAssigmentLesson({ courseId, lessonId, body });
      return;
    } catch (error) {
      if (!isNotFoundError(error)) throw error;
    }
  }

  await AssignmentLessonService.createAssigmentLesson({ courseId, lessonId, body });
}

async function upsertLessonContent(courseId: string, lesson: Lesson, lessonId: string, isExistingLesson: boolean) {
  if (lesson.type === "VIDEO") {
    await upsertVideoLessonContent(courseId, lesson, lessonId, isExistingLesson);
    return;
  }
  if (lesson.type === "ARTICLE") {
    await upsertArticleLessonContent(courseId, lesson, lessonId, isExistingLesson);
    return;
  }
  if (lesson.type === "QUIZ") {
    await upsertQuizLessonContent(courseId, lesson, lessonId, isExistingLesson);
    return;
  }
  await upsertAssignmentLessonContent(courseId, lesson, lessonId, isExistingLesson);
}

function getLessonContent(lesson: Lesson): LessonContent {
  return {
    videoDescription: "Introduce the lesson goals, prerequisites, and what learners should build.",
    quizQuestions: defaultQuizQuestions,
    passingScore: 70,
    assignmentInstructions: "Describe the task, expected deliverables, acceptance criteria, and submission format.",
    assignmentDueDays: 7,
    ...lesson.content,
  };
}

function LessonTypePicker({ lesson, patchLesson }: { lesson: Lesson; patchLesson: (patch: Partial<Lesson>) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(Object.keys(lessonTypeMeta) as LessonType[]).map((type) => {
        const item = lessonTypeMeta[type];
        const ContentIcon = item.icon;
        const active = lesson.type === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => patchLesson({ type })}
            className={cn(
              "rounded-[18px] border p-5 text-left transition",
              active ? "border-[#564FFD] bg-[#F8F8FF]" : "border-[#E9EAF0] bg-white hover:border-[#D8D6FF] hover:bg-[#F8F8FF]",
            )}
          >
            <ContentIcon className={cn("size-6", active ? "text-[#564FFD]" : "text-[#8C94A3]")} />
            <p className="mt-4 text-sm font-semibold text-[#1D2026]">{item.label}</p>
            <p className="mt-1 text-xs leading-5 text-[#6E7485]">{item.description}</p>
          </button>
        );
      })}
    </div>
  );
}

function LocalFilePreviewUrl({ file, children }: { file?: File; children: (url?: string) => React.ReactNode }) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return <>{children(url)}</>;
}

function VideoLessonEditor({ content, patchContent }: { content: LessonContent; patchContent: (patch: Partial<LessonContent>) => void }) {
  const videoQuestions = content.videoQuestions || [];
  const [recentCheckpointId, setRecentCheckpointId] = useState<string | undefined>();

  function patchVideoQuestions(nextQuestions: VideoCheckpointQuestion[]) {
    patchContent({ videoQuestions: nextQuestions });
  }

  function patchVideoQuestion(questionId: string, patch: Partial<VideoCheckpointQuestion>) {
    patchVideoQuestions(videoQuestions.map((question) => (question.id === questionId ? { ...question, ...patch } : question)));
  }

  function patchVideoQuestionOption(questionId: string, optionId: string, patch: Partial<VideoCheckpointQuestion["options"][number]>) {
    patchVideoQuestions(
      videoQuestions.map((question) =>
        question.id === questionId
          ? { ...question, options: question.options.map((option) => (option.id === optionId ? { ...option, ...patch } : option)) }
          : question,
      ),
    );
  }

  function toggleVideoCorrect(question: VideoCheckpointQuestion, optionId: string) {
    patchVideoQuestion(question.id, {
      options: question.options.map((option) => ({
        ...option,
        isCorrect: question.questionType === "SINGLE_CHOICE" ? option.id === optionId : option.id === optionId ? !option.isCorrect : option.isCorrect,
      })),
    });
  }

  function addVideoCheckpoint() {
    const checkpoint = createVideoCheckpointQuestion();
    patchVideoQuestions([...videoQuestions, checkpoint]);
    setRecentCheckpointId(checkpoint.id);
    window.setTimeout(() => setRecentCheckpointId(undefined), 1100);
  }

  return (
    <div className="space-y-5">
      <LocalFilePreviewUrl file={content.videoFile}>
        {(localVideoUrl) => {
          const previewUrl = localVideoUrl || content.videoUrl;
          return previewUrl ? (
            <div className="overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-[#111033]">
              <video src={previewUrl} controls className="aspect-video w-full bg-black object-contain" />
              <div className="flex flex-col gap-4 bg-white p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1D2026]">{content.videoFileName || "Current lesson video"}</p>
                  <p className="mt-1 text-xs text-[#8C94A3]">{content.videoFileSize || "Uploaded video is ready for preview."}</p>
                </div>
                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-[#564FFD] px-5 text-sm font-semibold text-white transition hover:bg-[#453FCA]">
                  <UploadCloud className="size-4" />
                  Replace video
                  <input
                    type="file"
                    accept="video/*,.m3u8"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      patchContent({
                        videoFile: file,
                        videoFileKey: undefined,
                        videoUrl: undefined,
                        videoFileName: file.name,
                        videoFileSize: formatBytes(file.size),
                        videoFileType: file.type || "video/mp4",
                      });
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="flex min-h-[520px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#C6CAD1] bg-[#FCFCFD] p-10 text-center transition hover:border-[#564FFD] hover:bg-[#F8F8FF]">
        <input
          type="file"
          accept="video/*,.m3u8"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            patchContent({
              videoFile: file,
              videoFileKey: undefined,
              videoUrl: undefined,
              videoFileName: file.name,
              videoFileSize: formatBytes(file.size),
              videoFileType: file.type || "video/mp4",
            });
          }}
        />
        <span className="flex size-16 items-center justify-center rounded-[22px] bg-[#EBEBFF] text-[#564FFD]">
          <UploadCloud className="size-8" />
        </span>
        <h4 className="mt-5 text-lg font-semibold text-[#1D2026]">
          {content.videoFileName || "Upload lesson video"}
        </h4>
        <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#6E7485]">
          Select a video for this lesson. You can replace it before publishing.
        </p>
        {content.videoFileSize ? <span className="mt-4 rounded-full bg-[#EBEBFF] px-3 py-1 text-xs font-medium text-[#564FFD]">{content.videoFileSize}</span> : null}
      </label>
          );
        }}
      </LocalFilePreviewUrl>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <EditableField
          label="Video description"
          value={content.videoDescription || ""}
          onChange={(videoDescription) => patchContent({ videoDescription })}
          helper="Shown as a short context note below the player."
          multiline
        />
        <div className="rounded-[18px] bg-[#111033] p-5 text-white">
          <p className="text-sm text-white/65">Video tips</p>
          <p className="mt-3 text-sm leading-6 text-white/75">Use clear audio, a steady pace, and a short recap at the end.</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#D8D6FF] bg-white p-5 shadow-[0_16px_40px_rgba(86,79,253,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-[#EBEBFF] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#564FFD]">
              In-video quiz
            </span>
            <h4 className="mt-3 text-lg font-semibold text-[#1D2026]">Checkpoint questions</h4>
            <p className="mt-1 text-sm text-[#6E7485]">
              Pause the video at an exact second. Learners must answer correctly before the video continues.
            </p>
          </div>
          <button
            type="button"
            onClick={addVideoCheckpoint}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#564FFD] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#453FCA] active:scale-[0.98]"
          >
            <Plus className="size-4" />
            {recentCheckpointId ? "Checkpoint added" : "Add video quiz"}
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          {videoQuestions.length ? videoQuestions.map((question, questionIndex) => (
            <article
              key={question.id}
              className={cn(
                "rounded-[16px] border border-[#E9EAF0] bg-[#FCFCFD] p-4 transition",
                recentCheckpointId === question.id && "animate-note-pop border-[#564FFD] bg-[#F8F8FF] shadow-[0_16px_36px_rgba(86,79,253,0.14)]",
              )}
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_180px_auto]">
                <input
                  value={question.prompt}
                  onChange={(event) => patchVideoQuestion(question.id, { prompt: event.target.value })}
                  className="h-12 rounded-[14px] border border-[#E9EAF0] bg-white px-4 text-sm font-semibold text-[#1D2026] outline-none focus:border-[#564FFD]"
                  placeholder={`Checkpoint question ${questionIndex + 1}`}
                />
                <input
                  type="number"
                  min={0}
                  value={question.timestampSeconds}
                  onChange={(event) => patchVideoQuestion(question.id, { timestampSeconds: Number(event.target.value) || 0 })}
                  className="h-12 rounded-[14px] border border-[#E9EAF0] bg-white px-4 text-sm font-semibold text-[#1D2026] outline-none focus:border-[#564FFD]"
                  placeholder="Seconds"
                />
                <select
                  value={question.questionType}
                  onChange={(event) => patchVideoQuestion(question.id, { questionType: event.target.value as "SINGLE_CHOICE" | "MULTI_CHOICE" })}
                  className="h-12 rounded-[14px] border border-[#E9EAF0] bg-white px-4 text-sm font-semibold text-[#1D2026] outline-none focus:border-[#564FFD]"
                >
                  <option value="SINGLE_CHOICE">Single choice</option>
                  <option value="MULTI_CHOICE">Multiple choice</option>
                </select>
                <button
                  type="button"
                  onClick={() => patchVideoQuestions(videoQuestions.filter((item) => item.id !== question.id))}
                  className="inline-flex size-12 items-center justify-center rounded-[14px] text-[#A1A5B3] transition hover:bg-[#FFF5F0] hover:text-[#E34444]"
                  aria-label="Delete checkpoint"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <label key={option.id} className={cn("flex items-center gap-3 rounded-[14px] border bg-white p-3", option.isCorrect ? "border-[#D8D6FF]" : "border-[#E9EAF0]")}>
                    <button
                      type="button"
                      onClick={() => toggleVideoCorrect(question, option.id)}
                      className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border", option.isCorrect ? "border-[#564FFD] bg-[#564FFD] text-white" : "border-[#CED1D9]")}
                    >
                      {option.isCorrect ? <CheckCircle2 className="size-4" /> : null}
                    </button>
                    <input
                      value={option.text}
                      onChange={(event) => patchVideoQuestionOption(question.id, option.id, { text: event.target.value })}
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1D2026] outline-none"
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => patchVideoQuestion(question.id, { options: question.options.filter((item) => item.id !== option.id) })}
                      className="rounded-full p-2 text-[#A1A5B3] transition hover:bg-[#FFF5F0] hover:text-[#E34444]"
                      aria-label="Delete option"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => patchVideoQuestion(question.id, { options: [...question.options, createVideoCheckpointOption(`Option ${question.options.length + 1}`, question.options.length)] })}
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#D8D6FF] px-4 text-sm font-semibold text-[#564FFD] transition hover:-translate-y-0.5 hover:bg-[#F7F7FF] active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Add option
              </button>
            </article>
          )) : (
            <button
              type="button"
              onClick={addVideoCheckpoint}
              className="flex min-h-[150px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D8D6FF] bg-[#F8F8FF] px-5 text-center transition hover:-translate-y-0.5 hover:border-[#564FFD] active:scale-[0.99]"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white text-[#564FFD] shadow-[0_12px_24px_rgba(86,79,253,0.12)]">
                <Plus className="size-5" />
              </span>
              <span className="mt-3 text-sm font-bold text-[#1D2026]">Create the first video quiz</span>
              <span className="mt-1 max-w-[460px] text-xs leading-5 text-[#6E7485]">
                Supports single choice and multiple choice checkpoints only.
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleLessonEditor({
  content,
  patchContent,
}: {
  content: LessonContent;
  patchContent: (patch: Partial<LessonContent>) => void;
}) {
  const hasArticleFile = Boolean(content.articleFile || content.articleFileKey);
  const articleFileSize = content.articleFileSize ? `${(content.articleFileSize / 1024 / 1024).toFixed(2)} MB` : null;

  return (
    <div className="grid min-h-[620px] gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <LocalFilePreviewUrl file={content.articleFile}>
        {(localArticleUrl) => {
          const previewUrl = localArticleUrl || content.articleUrl;
          return (
            <div className="overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white">
              {previewUrl ? (
                <iframe src={previewUrl} title={content.articleFileName || "Article PDF preview"} className="h-[520px] w-full bg-[#F5F7FA]" />
              ) : (
                <label
                  className={cn(
                    "flex h-full min-h-[520px] cursor-pointer flex-col items-center justify-center border border-dashed bg-white px-8 py-12 text-center transition hover:border-[#564FFD] hover:bg-[#F7F7FF]",
                    hasArticleFile ? "border-[#564FFD] bg-[#F7F7FF]" : "border-[#DADDE7]",
                  )}
                >
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (!file) return;
                      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                      if (!isPdf) return;

                      patchContent({
                        articleFile: file,
                        articleFileKey: undefined,
                        articleUrl: undefined,
                        articleFileName: file.name,
                        articleFileSize: file.size,
                        articleFileType: "application/pdf",
                      });
                    }}
                  />
                  <span className="flex size-20 items-center justify-center rounded-[26px] bg-[#EBEBFF] text-[#564FFD]">
                    {hasArticleFile ? <FileText className="size-9" /> : <UploadCloud className="size-9" />}
                  </span>
                  <h4 className="mt-6 max-w-[680px] text-xl font-semibold text-[#1D2026]">
                    {content.articleFileName || "Upload article PDF"}
                  </h4>
                  <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#6E7485]">
                    Attach a prepared PDF for this article lesson. Learners will read this file inside the learning page.
                  </p>
                  {articleFileSize ? <span className="mt-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#564FFD]">{articleFileSize}</span> : null}
                </label>
              )}
              {previewUrl ? (
                <div className="flex flex-col gap-4 border-t border-[#E9EAF0] p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#1D2026]">{content.articleFileName || "Article PDF"}</p>
                    <p className="mt-1 text-xs text-[#8C94A3]">{articleFileSize || "Uploaded PDF is ready for preview."}</p>
                  </div>
                  <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-[#564FFD] px-5 text-sm font-semibold text-white transition hover:bg-[#453FCA]">
                    <UploadCloud className="size-4" />
                    Replace PDF
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
                        if (!isPdf) return;
                        patchContent({
                          articleFile: file,
                          articleFileKey: undefined,
                          articleUrl: undefined,
                          articleFileName: file.name,
                          articleFileSize: file.size,
                          articleFileType: "application/pdf",
                        });
                      }}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          );
        }}
      </LocalFilePreviewUrl>

      <aside className="rounded-[18px] bg-[#111033] p-5 text-white">
        <p className="text-sm text-white/65">PDF article lesson</p>
        <div className="mt-5 space-y-4 text-sm leading-6 text-white/75">
          <p>Use a clear title page, readable typography, and practical examples.</p>
          <p>Only PDF files are accepted for article lessons.</p>
        </div>
        {hasArticleFile ? (
          <button
            type="button"
            onClick={() =>
              patchContent({
                articleFile: undefined,
                articleFileKey: undefined,
                articleUrl: undefined,
                articleFileName: undefined,
                articleFileSize: undefined,
                articleFileType: undefined,
              })
            }
            className="mt-6 inline-flex h-11 items-center justify-center rounded-[14px] bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Remove PDF
          </button>
        ) : null}
      </aside>
    </div>
  );
}

function QuizLessonEditor({ content, patchContent }: { content: LessonContent; patchContent: (patch: Partial<LessonContent>) => void }) {
  const questions = content.quizQuestions?.length ? content.quizQuestions : defaultQuizQuestions;
  const [recentQuestionId, setRecentQuestionId] = useState<string | undefined>();
  const questionCount = Math.max(1, questions.length);
  const questionsPerAttempt = clampNumber(Number(content.questionsPerAttempt) || questionCount, 1, questionCount);
  const quizTypes: Array<{ value: QuizQuestionType; label: string }> = [
    { value: "SINGLE_CHOICE", label: "Single choice" },
    { value: "MULTI_CHOICE", label: "Multiple choice" },
    { value: "MATCHING", label: "Matching" },
    { value: "ORDERING", label: "Ordering" },
    { value: "SHORT_TEXT", label: "Short answer" },
  ];
  const scoringOptions: Partial<Record<QuizQuestionType, Array<{ value: QuizScoringMethod; label: string }>>> = {
    SINGLE_CHOICE: [{ value: "ALL_OR_NOTHING", label: "All or nothing" }],
    MULTI_CHOICE: [
      { value: "ALL_OR_NOTHING", label: "All or nothing" },
      { value: "PARTIAL_CREDIT", label: "Partial credit" },
      { value: "NEGATIVE_MARK", label: "Negative mark" },
    ],
    ORDERING: [
      { value: "ALL_OR_NOTHING", label: "All or nothing" },
      { value: "PARTIAL_CREDIT", label: "Partial credit" },
    ],
    MATCHING: [
      { value: "ALL_OR_NOTHING", label: "All or nothing" },
      { value: "PARTIAL_CREDIT", label: "Partial credit" },
      { value: "NEGATIVE_MARK", label: "Negative mark" },
    ],
  };

  function patchQuestion(questionId: string, patch: Partial<QuizQuestion>) {
    patchContent({ quizQuestions: questions.map((question) => (question.id === questionId ? { ...question, ...patch } : question)) });
  }

  function changeQuestionType(question: QuizQuestion, questionType: QuizQuestionType) {
    patchQuestion(question.id, {
      questionType,
      scoringMethod: questionType === "MULTI_CHOICE" ? "PARTIAL_CREDIT" : "ALL_OR_NOTHING",
      options: createDefaultQuizOptions(questionType),
    });
  }

  function patchOption(questionId: string, optionId: string, patch: Partial<QuizQuestion["options"][number]>) {
    patchContent({
      quizQuestions: questions.map((question) =>
        question.id === questionId
          ? { ...question, options: question.options.map((option) => (option.id === optionId ? { ...option, ...patch } : option)) }
          : question,
      ),
    });
  }

  function toggleCorrect(question: QuizQuestion, optionId: string) {
    patchQuestion(question.id, {
      options: question.options.map((option) => ({
        ...option,
        isCorrect: question.questionType === "SINGLE_CHOICE" ? option.id === optionId : option.id === optionId ? !option.isCorrect : option.isCorrect,
      })),
    });
  }

  function addOption(question: QuizQuestion) {
    patchQuestion(question.id, {
      options: [
        ...question.options,
        createQuizOption(
          question.questionType === "SHORT_TEXT" ? "Accepted answer" : `Option ${question.options.length + 1}`,
          question.options.length,
          question.questionType === "MATCHING" || question.questionType === "SHORT_TEXT",
          question.questionType === "MATCHING" ? `Match ${question.options.length + 1}` : undefined,
        ),
      ],
    });
  }

  function deleteOption(question: QuizQuestion, optionId: string) {
    const nextOptions = question.options.filter((option) => option.id !== optionId).map((option, index) => ({ ...option, order: index }));
    patchQuestion(question.id, { options: nextOptions.length ? nextOptions : createDefaultQuizOptions(question.questionType) });
  }

  function addQuestion() {
    const question = createQuizQuestion("SINGLE_CHOICE");
    const nextQuestions = [...questions, question];
    const shouldUseFullPool = content.questionsPerAttempt === undefined || content.questionsPerAttempt >= questions.length;
    patchContent({
      quizQuestions: nextQuestions,
      questionsPerAttempt: shouldUseFullPool ? nextQuestions.length : content.questionsPerAttempt,
    });
    setRecentQuestionId(question.id);
    window.setTimeout(() => setRecentQuestionId(undefined), 1100);
  }

  function deleteQuestion(questionId: string) {
    const nextQuestions = questions.filter((question) => question.id !== questionId);
    const nextCount = Math.max(1, nextQuestions.length);
    patchContent({
      quizQuestions: nextQuestions,
      questionsPerAttempt: clampNumber(Number(content.questionsPerAttempt) || nextCount, 1, nextCount),
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-[18px] bg-[#FCFCFD] p-4 md:grid-cols-2">
        <EditableField
          label="Passing score"
          value={String(content.passingScore || 70)}
          onChange={(passingScore) => patchContent({ passingScore: Number(passingScore) || 0 })}
          helper="Percentage required to pass this quiz."
        />
        <label className="block">
          <span className="text-sm font-medium text-[#4E5566]">Questions per attempt</span>
          <input
            type="number"
            min={1}
            max={questionCount}
            value={questionsPerAttempt}
            onChange={(event) =>
              patchContent({
                questionsPerAttempt: clampNumber(Number(event.target.value) || 1, 1, questionCount),
              })
            }
            className="mt-2 h-12 w-full rounded-[14px] border border-[#E9EAF0] bg-white px-4 text-sm text-[#1D2026] transition focus:border-[#564FFD] focus:ring-0"
          />
          <span className="mt-2 block text-xs leading-5 text-[#8C94A3]">
            Learners receive {questionsPerAttempt} of {questionCount} questions per quiz attempt.
          </span>
        </label>
      </div>

      {questions.map((question, questionIndex) => (
        <article
          key={question.id}
          className={cn(
            "rounded-[18px] border border-[#E9EAF0] bg-white p-5 transition",
            recentQuestionId === question.id && "animate-note-pop border-[#564FFD] bg-[#F8F8FF] shadow-[0_16px_36px_rgba(86,79,253,0.14)]",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <EditableField
              label={`Question ${questionIndex + 1}`}
              value={question.prompt}
              onChange={(prompt) => patchQuestion(question.id, { prompt })}
              helper="Prompt shown to learners."
            />
            <button
              type="button"
              onClick={() => deleteQuestion(question.id)}
              className="mt-7 inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] text-[#A1A5B3] transition hover:bg-[#FFF5F0] hover:text-[#E34444]"
              aria-label={`Delete question ${questionIndex + 1}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className={cn("mt-4 grid gap-3", question.questionType === "SHORT_TEXT" ? "lg:grid-cols-[220px_minmax(0,1fr)]" : "lg:grid-cols-[220px_220px_minmax(0,1fr)]")}>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8C94A3]">Question type</span>
              <select
                value={question.questionType}
                onChange={(event) => changeQuestionType(question, event.target.value as QuizQuestionType)}
                className="mt-2 h-12 w-full rounded-[14px] border border-[#E9EAF0] bg-white px-3 text-sm font-semibold text-[#1D2026] outline-none transition focus:border-[#564FFD]"
              >
                {quizTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            {question.questionType !== "SHORT_TEXT" ? (
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8C94A3]">Scoring</span>
                <select
                  value={question.scoringMethod}
                  onChange={(event) => patchQuestion(question.id, { scoringMethod: event.target.value as QuizScoringMethod })}
                  className="mt-2 h-12 w-full rounded-[14px] border border-[#E9EAF0] bg-white px-3 text-sm font-semibold text-[#1D2026] outline-none transition focus:border-[#564FFD]"
                >
                  {(scoringOptions[question.questionType] || scoringOptions.SINGLE_CHOICE || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="rounded-[14px] bg-[#FCFCFD] px-4 py-3 text-sm leading-6 text-[#6E7485]">
              {question.questionType === "MATCHING"
                ? "Learners pair each left item with the matching text."
                : question.questionType === "ORDERING"
                  ? "Learners arrange these options in the order shown here."
                  : question.questionType === "SHORT_TEXT"
                    ? "Add one or more accepted answers. Learners pass if their text matches any accepted answer."
                    : "Mark the correct option choices below."}
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {question.options.map((option, optionIndex) => {
              const lockedCorrect = question.questionType === "MATCHING" || question.questionType === "ORDERING" || question.questionType === "SHORT_TEXT";
              const correct = lockedCorrect || option.isCorrect;

              return (
                <div
                  key={option.id}
                  className={cn(
                    "grid gap-3 rounded-[14px] border bg-[#FCFCFD] p-3 transition focus-within:border-[#564FFD] focus-within:bg-white",
                    question.questionType === "MATCHING"
                      ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                      : question.questionType === "SHORT_TEXT"
                        ? "md:grid-cols-[minmax(0,1fr)_auto]"
                        : "md:grid-cols-[auto_minmax(0,1fr)_auto]",
                    correct ? "border-[#D8D6FF]" : "border-[#E9EAF0]",
                  )}
                >
                  {question.questionType !== "MATCHING" && question.questionType !== "SHORT_TEXT" ? (
                    <button
                      type="button"
                      onClick={() => !lockedCorrect && toggleCorrect(question, option.id)}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full border transition",
                        correct ? "border-[#564FFD] bg-[#564FFD] text-white" : "border-[#CED1D9] bg-white text-transparent",
                      )}
                      aria-label={`Mark option ${optionIndex + 1} as correct`}
                    >
                      <CheckCircle2 className="size-5" />
                    </button>
                  ) : null}
                  <input
                    value={option.text}
                    onChange={(event) => patchOption(question.id, option.id, { text: event.target.value, isCorrect: question.questionType === "SHORT_TEXT" ? true : option.isCorrect })}
                    placeholder={question.questionType === "SHORT_TEXT" ? "Accepted answer" : `Option ${optionIndex + 1}`}
                    className={cn(
                      "min-w-0 rounded-[12px] bg-transparent px-3 py-2 text-sm font-medium text-[#1D2026] outline-none transition",
                      question.questionType === "SHORT_TEXT"
                        ? "border-0 focus:bg-transparent focus:ring-0"
                        : "border border-transparent focus:border-[#D8D6FF] focus:bg-white",
                    )}
                  />
                  {question.questionType === "MATCHING" ? (
                    <input
                      value={option.matchText || ""}
                      onChange={(event) => patchOption(question.id, option.id, { matchText: event.target.value, isCorrect: true })}
                      placeholder="Matching text"
                      className="min-w-0 rounded-[12px] border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-[#1D2026] outline-none transition focus:border-[#D8D6FF] focus:bg-white"
                    />
                  ) : question.questionType === "ORDERING" ? (
                    <span className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#EBEBFF] px-3 text-xs font-bold text-[#564FFD]">
                      Order {optionIndex + 1}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => deleteOption(question, option.id)}
                    className="inline-flex size-10 items-center justify-center rounded-[12px] text-[#A1A5B3] transition hover:bg-[#FFF5F0] hover:text-[#E34444]"
                    aria-label={`Delete option ${optionIndex + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => addOption(question)}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-[14px] border border-[#D8D6FF] px-4 text-sm font-semibold text-[#564FFD] transition hover:bg-[#F7F7FF]"
            >
              <Plus className="size-4" />
              {question.questionType === "SHORT_TEXT" ? "Add accepted answer" : "Add option"}
            </button>
          </div>
        </article>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-[16px] bg-[#564FFD] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(86,79,253,0.22)] transition hover:-translate-y-0.5 hover:bg-[#453FCA] hover:shadow-[0_16px_30px_rgba(86,79,253,0.30)]"
      >
        <Plus className="size-4" />
        {recentQuestionId ? "Question added" : "Add question"}
      </button>
    </div>
  );
}

function AssignmentLessonEditor({ content, patchContent }: { content: LessonContent; patchContent: (patch: Partial<LessonContent>) => void }) {
  const hasAttachment = Boolean(content.assignmentAttachmentFile || content.assignmentAttachment || content.assignmentAttachmentUrl);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <label className="block">
        <span className="text-sm font-medium text-[#4E5566]">Assignment instructions</span>
        <textarea
          value={content.assignmentInstructions || ""}
          onChange={(event) => patchContent({ assignmentInstructions: event.target.value })}
          rows={18}
          className="mt-2 min-h-[520px] w-full resize-none rounded-[18px] border border-[#E9EAF0] bg-white px-5 py-4 text-base leading-8 text-[#1D2026] transition focus:border-[#564FFD] focus:ring-0"
        />
        <span className="mt-2 block text-xs leading-5 text-[#8C94A3]">Explain deliverables, grading criteria, and submission rules.</span>
      </label>
      <aside className="space-y-4">
        <EditableField
          label="Due in days"
          value={String(content.assignmentDueDays || 7)}
          onChange={(assignmentDueDays) => patchContent({ assignmentDueDays: Number(assignmentDueDays) || 0 })}
          helper="Relative deadline after enrollment."
        />
        <label className="block rounded-[18px] border border-dashed border-[#C6CAD1] bg-[#FCFCFD] p-5 text-center transition hover:border-[#564FFD] hover:bg-[#F8F8FF]">
          <input
            type="file"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              patchContent({
                assignmentAttachmentFile: file,
                assignmentAttachmentFileKey: undefined,
                assignmentAttachmentUrl: undefined,
                assignmentAttachment: file.name,
                assignmentAttachmentType: file.type || "application/octet-stream",
                assignmentAttachmentSize: file.size,
              });
            }}
          />
          <UploadCloud className="mx-auto size-8 text-[#564FFD]" />
          <p className="mt-3 text-sm font-semibold text-[#1D2026]">{content.assignmentAttachment || "Attach rubric/template"}</p>
          <p className="mt-1 text-xs leading-5 text-[#8C94A3]">Optional file metadata for assignment resources.</p>
        </label>
        {hasAttachment ? (
          <div className="rounded-[18px] border border-[#E9EAF0] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EBEBFF] text-[#564FFD]">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#1D2026]">{content.assignmentAttachment || "Assignment attachment"}</p>
                <p className="mt-1 text-xs text-[#8C94A3]">
                  {content.assignmentAttachmentSize ? formatBytes(content.assignmentAttachmentSize) : "Uploaded resource"}
                </p>
                {content.assignmentAttachmentUrl ? (
                  <a
                    href={content.assignmentAttachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-[14px] bg-[#EBEBFF] px-3 text-xs font-semibold text-[#564FFD] transition hover:bg-[#DEDDFF]"
                  >
                    Preview file
                  </a>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                patchContent({
                  assignmentAttachmentFile: undefined,
                  assignmentAttachmentFileKey: undefined,
                  assignmentAttachmentUrl: undefined,
                  assignmentAttachment: undefined,
                  assignmentAttachmentType: undefined,
                  assignmentAttachmentSize: undefined,
                })
              }
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[14px] border border-[#FFE0D4] bg-[#FFF5F0] text-sm font-semibold text-[#E34444] transition hover:border-[#E34444]"
            >
              Remove attachment
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function LessonContentEditor({ lesson, patchLesson }: { lesson: Lesson; patchLesson: (patch: Partial<Lesson>) => void }) {
  const content = getLessonContent(lesson);

  function patchContent(patch: Partial<LessonContent>) {
    patchLesson({ content: { ...content, ...patch } });
  }

  if (lesson.type === "VIDEO") return <VideoLessonEditor content={content} patchContent={patchContent} />;
  if (lesson.type === "ARTICLE") return <ArticleLessonEditor content={content} patchContent={patchContent} />;
  if (lesson.type === "QUIZ") return <QuizLessonEditor content={content} patchContent={patchContent} />;
  return <AssignmentLessonEditor content={content} patchContent={patchContent} />;
}

function ContentStep({
  sections,
  setSections,
  selectedLessonId,
  setSelectedLessonId,
}: {
  sections: Section[];
  setSections: (sections: Section[]) => void;
  selectedLessonId?: string;
  setSelectedLessonId: (lessonId: string) => void;
}) {
  const [lessonDrawerOpen, setLessonDrawerOpen] = useState(true);
  const selectedLesson = sections.flatMap((section) => section.lessons).find((item) => item.id === selectedLessonId) || sections[0]?.lessons[0];
  const lesson = selectedLesson;
  if (!lesson) {
    return (
      <div className="rounded-[18px] border border-dashed border-[#C6CAD1] bg-[#FCFCFD] p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-[18px] bg-[#EBEBFF] text-[#564FFD]">
          <Plus className="size-7" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-[#1D2026]">No lessons yet</h3>
        <p className="mx-auto mt-2 max-w-[520px] text-sm leading-6 text-[#6E7485]">
          Go back to Curriculum, create a section, then add a lesson before configuring lesson content.
        </p>
      </div>
    );
  }
  const meta = lessonTypeMeta[lesson.type];
  const Icon = meta.icon;

  function patchLesson(patch: Partial<Lesson>) {
    setSections(
      sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((item) => (item.id === lesson.id ? { ...item, ...patch } : item)),
      })),
    );
  }

  return (
    <div className={cn("grid gap-5 transition-all", lessonDrawerOpen ? "xl:grid-cols-[340px_minmax(0,1fr)]" : "xl:grid-cols-[72px_minmax(0,1fr)]")}>
      <aside className="sticky top-6 h-fit rounded-[18px] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          {lessonDrawerOpen ? (
            <div>
              <h3 className="font-semibold text-[#1D2026]">Lessons</h3>
              <p className="mt-1 text-sm leading-6 text-[#6E7485]">Select one lesson to edit its content.</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setLessonDrawerOpen((open) => !open)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border border-[#E9EAF0] bg-white text-[#4E5566] transition hover:border-[#D8D6FF] hover:text-[#564FFD]"
            aria-label={lessonDrawerOpen ? "Collapse lessons drawer" : "Expand lessons drawer"}
          >
            {lessonDrawerOpen ? <PanelLeftClose className="size-5" /> : <PanelLeftOpen className="size-5" />}
          </button>
        </div>
        <div className={cn("mt-4 max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-1", !lessonDrawerOpen && "pr-0")}>
          {sections.map((section) => (
            <div key={section.id}>
              {lessonDrawerOpen ? <p className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#8C94A3]">{section.title}</p> : null}
              {section.lessons.map((item) => {
                const itemMeta = lessonTypeMeta[item.type];
                const ItemIcon = itemMeta.icon;
                const active = item.id === lesson.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLessonId(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[14px] border p-3 text-left transition",
                      active ? "border-[#564FFD] bg-[#F8F8FF]" : "border-transparent bg-white hover:border-[#D8D6FF] hover:bg-[#F8F8FF]",
                      !lessonDrawerOpen && "justify-center px-2",
                    )}
                  >
                    <span className={cn("flex size-9 items-center justify-center rounded-[12px]", itemMeta.tone)}>
                      <ItemIcon className="size-4" />
                    </span>
                    {lessonDrawerOpen ? <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#1D2026]">{item.title}</span>
                      <span className="text-xs text-[#8C94A3]">{itemMeta.label} · {minutesLabel(item.duration)}</span>
                    </span> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-[18px] bg-white p-5">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-12 items-center justify-center rounded-[18px]", meta.tone)}>
            <Icon className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1D2026]">{lesson.title}</p>
            <p className="mt-1 text-xs text-[#8C94A3]">{meta.description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <EditableField label="Lesson title" value={lesson.title} onChange={(title) => patchLesson({ title })} helper="Use a clear title learners can recognize later." />
          <EditableField label="Duration minutes" value={String(lesson.duration)} onChange={(duration) => patchLesson({ duration: Number(duration) || 0 })} />
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => patchLesson({ preview: !lesson.preview })}
              className="w-full text-left"
            >
              <ToggleRow title="Preview lesson" copy="Let learners watch or read this lesson before enrolling." active={Boolean(lesson.preview)} />
            </button>
          </div>
        </div>
        </div>

      <div className="rounded-[18px] bg-white p-6">
        <h3 className="text-lg font-semibold text-[#1D2026]">Configure lesson content</h3>
        <p className="mt-2 text-sm leading-6 text-[#6E7485]">
          Choose the lesson format, then add the material learners will use.
        </p>

        <div className="mt-6">
          <LessonTypePicker lesson={lesson} patchLesson={patchLesson} />
        </div>

        <div className="mt-6 rounded-[18px] border border-[#E9EAF0] bg-[#FCFCFD] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1D2026]">{meta.label} content</p>
              <p className="mt-1 text-xs text-[#8C94A3]">{meta.description}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#6E7485]">Draft</span>
          </div>
          <LessonContentEditor lesson={lesson} patchLesson={patchLesson} />
        </div>
      </div>
      </section>
    </div>
  );
}

function MediaStep({
  courseImages,
  setCourseImages,
  onRemovePersistedImage,
}: {
  courseImages: CourseImage[];
  setCourseImages: (images: CourseImage[]) => void;
  onRemovePersistedImage: (imageId: string) => void;
}) {
  function addImages(files: FileList | null) {
    if (!files?.length) return;

    const hasCover = courseImages.some((image) => image.isCover);
    const newImages = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file, index) => ({
        id: `course-image-${Date.now()}-${index}`,
        fileKey: draftFileKey("course-images", file.name),
        file,
        name: file.name,
        size: formatBytes(file.size),
        url: URL.createObjectURL(file),
        isCover: !hasCover && courseImages.length === 0 && index === 0,
      }));

    setCourseImages([...courseImages, ...newImages]);
  }

  function removeImage(imageId: string) {
    const image = courseImages.find((item) => item.id === imageId);
    if (image?.url.startsWith("blob:")) URL.revokeObjectURL(image.url);
    if (image?.uploaded && !image.file) onRemovePersistedImage(image.id);

    const nextImages = courseImages.filter((item) => item.id !== imageId);
    if (image?.isCover && nextImages[0]) {
      setCourseImages(nextImages.map((item, index) => ({ ...item, isCover: index === 0 })));
      return;
    }

    setCourseImages(nextImages);
  }

  function setCover(imageId: string) {
    setCourseImages(courseImages.map((image) => ({ ...image, isCover: image.id === imageId })));
  }

  const coverImage = courseImages.find((image) => image.isCover) || courseImages[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="space-y-5">
        <label className="flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed border-[#C6CAD1] bg-white p-10 text-center transition hover:border-[#564FFD] hover:bg-[#F8F8FF]">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              addImages(event.target.files);
              event.currentTarget.value = "";
            }}
          />
          <div className="mx-auto flex size-16 items-center justify-center rounded-[22px] bg-[#EBEBFF] text-[#564FFD]">
            <UploadCloud className="size-8" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-[#1D2026]">Upload course images</h3>
          <p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[#6E7485]">
            Select one or more images for the course gallery. The first uploaded image is used as the cover by default.
          </p>
          <span className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] px-6 text-sm font-semibold text-white">
            Select images
          </span>
        </label>

        {courseImages.length ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {courseImages.map((image) => (
              <article key={image.id} className="overflow-hidden rounded-[18px] border border-[#E9EAF0] bg-white">
                <div className="relative aspect-video bg-[#F5F7FA]">
                  <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                  {image.isCover ? (
                    <span className="absolute left-3 top-3 rounded-full bg-[#564FFD] px-3 py-1 text-xs font-semibold text-white">Cover</span>
                  ) : null}
                </div>
                <div className="space-y-4 p-4">
                  <div>
                    <p className="truncate text-sm font-semibold text-[#1D2026]">{image.name}</p>
                    <p className="mt-1 text-xs text-[#8C94A3]">{image.size}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCover(image.id)}
                      className={cn(
                        "inline-flex h-10 flex-1 items-center justify-center rounded-[14px] border px-3 text-sm font-semibold transition",
                        image.isCover ? "border-[#564FFD] bg-[#F8F8FF] text-[#564FFD]" : "border-[#E9EAF0] text-[#4E5566] hover:border-[#D8D6FF] hover:text-[#564FFD]",
                      )}
                    >
                      Set cover
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="inline-flex size-10 items-center justify-center rounded-[14px] text-[#A1A5B3] transition hover:bg-[#FFF5F0] hover:text-[#E34444]"
                      aria-label={`Remove ${image.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <aside className="rounded-[18px] bg-white p-5">
        <h3 className="font-semibold text-[#1D2026]">Media requirements</h3>
        <div className="mt-4 space-y-3">
          {["At least one cover image", "16:9 recommended preview", "Gallery images are optional"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-[#6E7485]">
              <CheckCircle2 className="size-4 text-[#23BD33]" />
              {item}
            </div>
          ))}
        </div>
        {coverImage ? (
          <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E9EAF0]">
            <img src={coverImage.url} alt={coverImage.name} className="aspect-video w-full object-cover" />
            <div className="p-4">
              <p className="text-sm font-semibold text-[#1D2026]">Current cover</p>
              <p className="mt-1 truncate text-xs text-[#8C94A3]">{coverImage.name}</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[18px] border border-dashed border-[#C6CAD1] bg-[#FCFCFD] p-5 text-sm leading-6 text-[#6E7485]">
            No course image selected yet.
          </div>
        )}
        <div className="mt-6 rounded-[18px] bg-[#111033] p-5 text-white">
          <p className="text-sm text-white/65">Image tips</p>
          <p className="mt-3 text-sm leading-6 text-white/75">Use a clean 16:9 cover image that clearly represents the course outcome.</p>
        </div>
      </aside>
    </div>
  );
}

function ReviewStep({ sections, courseImages }: { sections: Section[]; courseImages: CourseImage[] }) {
  const lessonCount = sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const previewCount = sections.reduce((sum, section) => sum + section.lessons.filter((lesson) => lesson.preview).length, 0);
  const checks = [
    { label: "Course basics completed", done: true, detail: "Title, category, and description are ready." },
    { label: `${sections.length} sections created`, done: sections.length > 0, detail: "The curriculum has a clear structure." },
    { label: `${lessonCount} lessons created`, done: lessonCount > 0, detail: "Learners have materials to follow." },
    { label: `${previewCount} preview lesson selected`, done: previewCount > 0, detail: "A preview helps learners evaluate the course." },
    { label: `${courseImages.length} course image${courseImages.length === 1 ? "" : "s"} ready`, done: courseImages.length > 0, detail: "A cover image improves the course listing." },
    { label: "Ready for approval", done: false, detail: "Review everything before submitting." },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <article key={check.label} className="rounded-[18px] border border-[#E9EAF0] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[14px]", check.done ? "bg-[#E1F7E3] text-[#23BD33]" : "bg-[#FFF2E5] text-[#FD8E1F]")}>
                {check.done ? <CheckCircle2 className="size-5" /> : <ListChecks className="size-5" />}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#1D2026]">{check.label}</h3>
                <p className="mt-1 text-xs text-[#8C94A3]">{check.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="rounded-[18px] bg-[#111033] p-5 text-white">
        <p className="text-sm text-white/65">Approval readiness</p>
        <strong className="mt-2 block text-3xl">74%</strong>
        <div className="mt-4 h-2 rounded-full bg-white/15">
          <div className="h-full w-[74%] rounded-full bg-[#23BD33]" />
        </div>
        <button className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[#564FFD] text-sm font-semibold text-white">
          Submit for approval
          <ArrowRight className="size-4" />
        </button>
      </aside>
    </div>
  );
}

function StepBody({
  activeStep,
  basics,
  setBasics,
  sections,
  setSections,
  courseImages,
  setCourseImages,
  onRemovePersistedImage,
  selectedSectionId,
  setSelectedSectionId,
  selectedLessonId,
  setSelectedLessonId,
}: {
  activeStep: StepId;
  basics: CourseBasics;
  setBasics: (basics: CourseBasics) => void;
  sections: Section[];
  setSections: (sections: Section[]) => void;
  courseImages: CourseImage[];
  setCourseImages: (images: CourseImage[]) => void;
  onRemovePersistedImage: (imageId: string) => void;
  selectedSectionId?: string;
  setSelectedSectionId: (sectionId: string) => void;
  selectedLessonId?: string;
  setSelectedLessonId: (lessonId: string) => void;
}) {
  if (activeStep === "basics") return <BasicsStep basics={basics} setBasics={setBasics} />;
  if (activeStep === "pricing") return <PricingStep basics={basics} setBasics={setBasics} />;
  if (activeStep === "curriculum") {
    return (
      <CurriculumStep
        sections={sections}
        setSections={setSections}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
      />
    );
  }
  if (activeStep === "content") {
    return (
      <ContentStep
        sections={sections}
        setSections={setSections}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
      />
    );
  }
  if (activeStep === "media") {
    return (
      <MediaStep
        courseImages={courseImages}
        setCourseImages={setCourseImages}
        onRemovePersistedImage={onRemovePersistedImage}
      />
    );
  }
  return <ReviewStep sections={sections} courseImages={courseImages} />;
}

function ReadinessPanel({ sections, courseImages, activeStep }: { sections: Section[]; courseImages: CourseImage[]; activeStep: StepId }) {
  const lessons = sections.flatMap((section) => section.lessons);
  const activeIndex = steps.findIndex((step) => step.id === activeStep);
  const totalDuration = sections.reduce((sum, section) => sum + section.duration, 0);

  return (
    <aside className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
      <div className="rounded-[18px] bg-[#111033] p-5 text-white">
        <p className="text-sm text-white/65">Wizard progress</p>
        <strong className="mt-2 block text-3xl">{Math.round(((activeIndex + 1) / steps.length) * 100)}%</strong>
        <div className="mt-4 h-2 rounded-full bg-white/15">
          <div className="h-full rounded-full bg-[#23BD33]" style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-[18px] bg-white p-5">
        <h3 className="font-semibold text-[#1D2026]">Course snapshot</h3>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Sections", sections.length],
            ["Lessons", lessons.length],
            ["Preview", lessons.filter((lesson) => lesson.preview).length],
            ["Duration", minutesLabel(totalDuration)],
            ["Images", courseImages.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[14px] bg-[#F8F8FF] p-3">
              <p className="text-xs text-[#8C94A3]">{label}</p>
              <p className="mt-1 text-lg font-semibold text-[#1D2026]">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] bg-white p-5">
        <h3 className="font-semibold text-[#1D2026]">Next step</h3>
        <p className="mt-2 text-sm leading-6 text-[#6E7485]">
          {steps[activeIndex]?.description} is the current focus for this course draft.
        </p>
      </div>
    </aside>
  );
}

type CourseCreateOptionsPageProps = {
  mode?: "create" | "edit";
  courseId?: string;
};

function mapCurriculumSections(sections: NonNullable<Awaited<ReturnType<typeof CourseService.getEditableDraftCurriculum>>["data"]>["sections"]): Section[] {
  return (sections || []).map((section, sectionIndex) => ({
    id: section.id || `section-${sectionIndex}`,
    serverId: section.id,
    title: section.title || `Section ${sectionIndex + 1}`,
    description: section.description || "",
    duration: section.duration || 0,
    lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
      id: lesson.id || `lesson-${sectionIndex}-${lessonIndex}`,
      serverId: lesson.id,
      title: lesson.title || `Lesson ${lessonIndex + 1}`,
      type: lesson.lessonType || "VIDEO",
      duration: lesson.duration || 0,
      preview: Boolean(lesson.isPreview),
    })),
  }));
}

function mapApiQuizQuestions(items: NonNullable<Awaited<ReturnType<typeof QuizQuestionService.getQuestions>>["data"]>): QuizQuestion[] {
  return (items || []).map((question, questionIndex) => ({
    id: question.id || `question-${questionIndex}`,
    serverId: question.id,
    prompt: question.questionText || `Question ${questionIndex + 1}`,
    questionType: (question.questionType === "ESSAY" ? "SHORT_TEXT" : question.questionType || "SINGLE_CHOICE") as QuizQuestionType,
    scoringMethod: question.scoringMethod || "ALL_OR_NOTHING",
    options: question.options?.length
      ? question.options.map((option, optionIndex) => ({
          id: option.id || `option-${questionIndex}-${optionIndex}`,
          serverId: option.id,
          text: option.optionText || "",
          isCorrect: Boolean(option.isCorrect),
          order: option.optionOrder ?? optionIndex,
          matchText: option.matchText || "",
        }))
      : createDefaultQuizOptions((question.questionType === "ESSAY" ? "SHORT_TEXT" : question.questionType || "SINGLE_CHOICE") as QuizQuestionType),
  }));
}

async function hydrateQuizQuestionContent(courseId: string, sections: Section[]) {
  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      lessons: await Promise.all(
        section.lessons.map(async (lesson) => {
          if (lesson.type !== "QUIZ" || !lesson.serverId) return lesson;
          const [quizResponse, questionsResponse] = await Promise.all([
            QuizLessonService.getQuizByLessonId({ courseId, lessonId: lesson.serverId }).catch(() => undefined),
            QuizQuestionService.getQuestions({ courseId, lessonId: lesson.serverId }).catch(() => undefined),
          ]);
          const rawQuestions = questionsResponse?.data?.length ? questionsResponse.data : quizResponse?.data?.questions || [];
          const quizQuestions = rawQuestions.length ? mapApiQuizQuestions(rawQuestions) : [];
          return quizQuestions.length
            ? {
                ...lesson,
                duration: quizResponse?.data?.duration || lesson.duration,
                content: {
                ...lesson.content,
                quizQuestions,
                questionsPerAttempt: quizResponse?.data?.numberOfQuestionPerQuizSession || quizQuestions.length,
              },
            }
            : lesson;
        }),
      ),
    })),
  );
}

async function hydrateVideoLessonContent(courseId: string, sections: Section[]) {
  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      lessons: await Promise.all(
        section.lessons.map(async (lesson) => {
          if (lesson.type !== "VIDEO" || !lesson.serverId) return lesson;
          const response = await VideoLessonService.getVideoByLessonId({ courseId, lessonId: lesson.serverId }).catch(() => undefined);
          const video = response?.data;
          if (!video) return lesson;
          return {
            ...lesson,
            duration: video.duration || lesson.duration,
            content: {
              ...lesson.content,
              videoUrl: video.videoUrl,
              videoFileName: video.fileName || lesson.title,
              videoFileType: video.fileType || "video/mp4",
              videoFileSize: typeof video.fileSize === "number" ? formatBytes(video.fileSize) : undefined,
            },
          };
        }),
      ),
    })),
  );
}

async function hydrateArticleLessonContent(courseId: string, sections: Section[]) {
  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      lessons: await Promise.all(
        section.lessons.map(async (lesson) => {
          if (lesson.type !== "ARTICLE" || !lesson.serverId) return lesson;
          const response = await ArticleLessonService.getArticleByLessonId({ courseId, lessonId: lesson.serverId }).catch(() => undefined);
          const article = response?.data;
          if (!article) return lesson;
          return {
            ...lesson,
            content: {
              ...lesson.content,
              articleUrl: article.articleUrl,
              articleFileName: article.fileName || lesson.title,
              articleFileType: article.fileType || "application/pdf",
              articleFileSize: article.fileSize,
            },
          };
        }),
      ),
    })),
  );
}

async function hydrateAssignmentLessonContent(courseId: string, sections: Section[]) {
  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      lessons: await Promise.all(
        section.lessons.map(async (lesson) => {
          if (lesson.type !== "ASSIGNMENT" || !lesson.serverId) return lesson;
          const response = await AssignmentLessonService.getAssigmentByLessonId({ courseId, lessonId: lesson.serverId }).catch(() => undefined);
          const assignment = response?.data;
          if (!assignment) return lesson;
          const attachment = assignment.attachments?.[0];
          return {
            ...lesson,
            content: {
              ...lesson.content,
              assignmentInstructions: assignment.description || "",
              assignmentAttachment: attachment?.fileName,
              assignmentAttachmentType: attachment?.fileType,
              assignmentAttachmentSize: attachment?.fileSize,
              assignmentAttachmentUrl: attachment?.attachmentUrl,
            },
          };
        }),
      ),
    })),
  );
}

function mapApiVideoQuestions(items: NonNullable<Awaited<ReturnType<typeof VideoQuestionService.getQuestionsByLessonId>>["data"]>): VideoCheckpointQuestion[] {
  return (items || []).map((question, questionIndex) => ({
    id: question.id || `video-question-${questionIndex}`,
    serverId: question.id,
    prompt: question.questionText || `Video checkpoint ${questionIndex + 1}`,
    questionType: question.questionType || "SINGLE_CHOICE",
    timestampSeconds: question.timestampSeconds || 0,
    options: (question.options || []).map((option, optionIndex) => ({
      id: option.id || `video-option-${questionIndex}-${optionIndex}`,
      serverId: option.id,
      text: option.optionText || "",
      isCorrect: Boolean(option.isCorrect),
    })),
  }));
}

async function hydrateVideoQuestionContent(courseId: string, sections: Section[]) {
  return Promise.all(
    sections.map(async (section) => ({
      ...section,
      lessons: await Promise.all(
        section.lessons.map(async (lesson) => {
          if (lesson.type !== "VIDEO" || !lesson.serverId) return lesson;
          const response = await VideoQuestionService.getQuestionsByLessonId({ courseId, lessonId: lesson.serverId }).catch(() => undefined);
          const videoQuestions = response?.data ? mapApiVideoQuestions(response.data) : [];
          return videoQuestions.length ? { ...lesson, content: { ...lesson.content, videoQuestions } } : lesson;
        }),
      ),
    })),
  );
}

export function CourseCreateOptionsPage({ mode = "create", courseId }: CourseCreateOptionsPageProps) {
  const isEditMode = mode === "edit";
  const [activeStep, setActiveStep] = useState<StepId>("basics");
  const [basics, setBasics] = useState<CourseBasics>(() =>
    isEditMode
      ? {
          ...defaultCourseBasics,
          title: "Loading course...",
          description: "",
          price: "0",
          discountedPrice: "0",
          certificateTitle: "",
        }
      : defaultCourseBasics,
  );
  const [sections, setSections] = useState(initialSections);
  const [courseImages, setCourseImages] = useState<CourseImage[]>([]);
  const [draftCourseId, setDraftCourseId] = useState<string | undefined>(courseId);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "submitting" | "submitted" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedImageKeys, setSavedImageKeys] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const courseImagesRef = useRef<CourseImage[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState(initialSections[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState(initialSections[0].lessons[0].id);
  const backgroundSaveTimerRef = useRef<number | undefined>(undefined);
  const backgroundSavePromiseRef = useRef<Promise<string | undefined> | undefined>(undefined);
  const activeIndex = steps.findIndex((step) => step.id === activeStep);
  const active = useMemo(() => steps[activeIndex] || steps[0], [activeIndex]);

  useEffect(() => {
    if (!courseId || !isEditMode) return;

    let isMounted = true;
    const editableCourseId = courseId;

    async function loadCourseDraft() {
      setSaveState("saving");
      setSaveMessage("Loading course draft...");

      try {
        const [draftCourseResponse, readableCourseResponse, draftCurriculumResponse, readableCurriculumResponse] = await Promise.all([
          safeApiCall(() => CourseService.getEditableCourseDraft({ id: editableCourseId })),
          safeApiCall(() => CourseService.getReadableCourseById({ id: editableCourseId })),
          safeApiCall(() => CourseService.getEditableDraftCurriculum({ id: editableCourseId })),
          safeApiCall(() => CourseService.getReadableCurriculum({ id: editableCourseId })),
        ]);
        const course = draftCourseResponse?.data || readableCourseResponse?.data;

        if (!isMounted) return;

        if (!course) {
          throw new Error("Could not find this course. Please refresh the courses page and try again.");
        }

        setBasics({
          title: course.title || "Untitled course",
          categoryId: course.category?.id || defaultCourseBasics.categoryId,
          categoryName: course.category?.name || defaultCourseBasics.categoryName,
          description: course.description || "",
          price: String(course.price ?? 0),
          discountedPrice: String(course.discountedPrice ?? course.price ?? 0),
          durationLabel: minutesLabel(course.duration || 0),
          isInSubscription: Boolean(course.isInSubscription),
          hasCertificate: Boolean(course.hasCertificate),
          certificateTitle: course.certificateTitle || "",
        });
        setCourseImages(
          (course.images || []).map((image, index) => ({
            id: image.id || `course-image-${index}`,
            fileKey: image.imageUrl || "",
            name: `Course image ${index + 1}`,
            size: "",
            url: image.imageUrl || "",
            isCover: index === 0,
            uploaded: true,
          })),
        );
        setSavedImageKeys((course.images || []).map((image) => image.imageUrl || "").filter(Boolean));
        setDeletedImageIds([]);

        const curriculum = draftCurriculumResponse?.data || readableCurriculumResponse?.data;
        const mappedSections = mapCurriculumSections(curriculum?.sections);
        if (mappedSections.length) {
          const videoContentSections = await hydrateVideoLessonContent(editableCourseId, mappedSections);
          const articleContentSections = await hydrateArticleLessonContent(editableCourseId, videoContentSections);
          const assignmentContentSections = await hydrateAssignmentLessonContent(editableCourseId, articleContentSections);
          const quizHydratedSections = await hydrateQuizQuestionContent(editableCourseId, assignmentContentSections);
          const hydratedSections = await hydrateVideoQuestionContent(editableCourseId, quizHydratedSections);
          if (!isMounted) return;
          setSections(hydratedSections);
          setSelectedSectionId(hydratedSections[0].id);
          setSelectedLessonId(hydratedSections[0].lessons[0]?.id || "");
        }

        setDraftCourseId(editableCourseId);
        setSaveState("idle");
        setSaveMessage("");
      } catch (error) {
        if (!isMounted) return;
        setSaveState("error");
        setSaveMessage(error instanceof Error ? error.message : "Could not load course draft.");
      }
    }

    void loadCourseDraft();

    return () => {
      isMounted = false;
    };
  }, [courseId, isEditMode]);

  useEffect(() => {
    courseImagesRef.current = courseImages;
  }, [courseImages]);

  useEffect(() => {
  return () => {
      if (backgroundSaveTimerRef.current) {
        window.clearTimeout(backgroundSaveTimerRef.current);
      }
      courseImagesRef.current.forEach((image) => {
        if (image.url.startsWith("blob:")) URL.revokeObjectURL(image.url);
      });
    };
  }, []);

  function queuePersistedImageRemoval(imageId: string) {
    setDeletedImageIds((current) => (current.includes(imageId) ? current : [...current, imageId]));
  }

  function goNext() {
    setActiveStep(steps[Math.min(steps.length - 1, activeIndex + 1)].id);
    scheduleBackgroundSave();
  }

  function goBack() {
    setActiveStep(steps[Math.max(0, activeIndex - 1)].id);
  }

  function scheduleBackgroundSave() {
    if (backgroundSaveTimerRef.current) {
      window.clearTimeout(backgroundSaveTimerRef.current);
    }

    backgroundSaveTimerRef.current = window.setTimeout(() => {
      backgroundSavePromiseRef.current = saveDraft({ silentSuccess: true, background: true })
        .catch(() => undefined)
        .finally(() => {
          backgroundSavePromiseRef.current = undefined;
        });
    }, 700);
  }

  async function saveDraft(options?: { silentSuccess?: boolean; background?: boolean }) {
    if (!options?.background) {
      setSaveState((state) => (state === "submitting" ? state : "saving"));
      setSaveMessage("");
    }

    try {
      const courseBody = createCourseDraftPayload(sections, basics);
      const course = draftCourseId
        ? getApiData(await CourseService.updateCourse({ id: draftCourseId, body: courseBody }), "Could not update course draft.")
        : getApiData(await CourseService.createCourse({ body: courseBody }), "Could not create course draft.");
      const courseId = course.id || draftCourseId;

      if (!courseId) throw new Error("Course draft was saved but no course id was returned.");
      setDraftCourseId(courseId);

      await syncDeletedCurriculumItems(courseId, sections);

      const nextSections: Section[] = [];

      for (const section of sections) {
        const savedSection = section.serverId
          ? getApiData(
              await SectionService.updateSection({
                courseId,
                sectionId: section.serverId,
                body: {
                  title: section.title,
                  description: section.description,
                  duration: section.duration,
                },
              }),
              "Could not update section.",
            )
          : getApiData(
              await SectionService.createSection({
                courseId,
                body: {
                  title: section.title,
                  description: section.description,
                  duration: section.duration,
                },
              }),
              "Could not create section.",
            );

        const sectionId = savedSection.id || section.serverId;
        if (!sectionId) throw new Error(`Section "${section.title}" was saved but no section id was returned.`);

        const nextLessons: Lesson[] = [];

        for (const lesson of section.lessons) {
          const savedLesson = lesson.serverId
            ? getApiData(
                await LessonService.updateLesson({
                  courseId,
                  sectionId,
                  lessonId: lesson.serverId,
                  body: {
                    title: lesson.title,
                    duration: lesson.duration,
                    isPreview: Boolean(lesson.preview),
                    prerequisiteIds: [],
                  },
                }),
                "Could not update lesson.",
              )
            : getApiData(
                await LessonService.createLesson({
                  courseId,
                  sectionId,
                  body: {
                    title: lesson.title,
                    duration: lesson.duration,
                    lessonType: lesson.type,
                    isPreview: Boolean(lesson.preview),
                    prerequisiteIds: [],
                  },
                }),
                "Could not create lesson.",
              );

          const lessonId = savedLesson.id || lesson.serverId;
          if (!lessonId) throw new Error(`Lesson "${lesson.title}" was saved but no lesson id was returned.`);

          const shouldPersistLessonContent = !lesson.serverId || hasMeaningfulLessonContent(lesson);
          if (shouldPersistLessonContent) {
            await upsertLessonContent(courseId, lesson, lessonId, Boolean(lesson.serverId));
          }

          nextLessons.push({ ...lesson, serverId: lessonId });
        }

        nextSections.push({ ...section, serverId: sectionId, lessons: nextLessons });
      }

      if (deletedImageIds.length) {
        await Promise.all(
          deletedImageIds.map((imageId) =>
            CourseImageService.deleteCourseImage({
              courseId,
              imageId,
            }),
          ),
        );
        setDeletedImageIds([]);
      }

      if (courseImages.length) {
        const coverFirstImages = [...courseImages].sort((left, right) => Number(right.isCover) - Number(left.isCover));
        const uploadedImages: CourseImage[] = [];

        for (const image of coverFirstImages) {
          if (image.file && !image.uploaded) {
            const fileKey = await uploadFileWithPresignedUrl(image.file);
            uploadedImages.push({ ...image, fileKey, uploaded: true });
          } else {
            uploadedImages.push(image);
          }
        }

        const unsyncedImages = uploadedImages.filter((image) => !savedImageKeys.includes(image.fileKey));

        if (unsyncedImages.length) {
          await CourseImageService.uploadCourseImages({
            courseId,
            body: { images: unsyncedImages.map((image) => ({ fileKey: image.fileKey })) },
          });
          setSavedImageKeys([...savedImageKeys, ...unsyncedImages.map((image) => image.fileKey)]);
        }

        setCourseImages(uploadedImages);
      }

      setSections(nextSections);
      if (!options?.silentSuccess) {
        setSaveState("saved");
        setSaveMessage("Draft saved successfully.");
      }
      return courseId;
    } catch (error) {
      if (!options?.background) {
        setSaveState("error");
        setSaveMessage(getErrorMessage(error, "Could not save draft."));
      }
      throw error;
    }
  }

  async function submitForApproval() {
    setSaveState("submitting");
    setSaveMessage("");

    try {
      if (backgroundSaveTimerRef.current) {
        window.clearTimeout(backgroundSaveTimerRef.current);
      }
      await backgroundSavePromiseRef.current?.catch(() => undefined);
      const courseId = await saveDraft({ silentSuccess: true });
      await CourseService.submitCourse({ id: courseId });
      setSaveState("submitted");
      setSaveMessage("Course submitted for approval.");
      setActiveStep("review");
    } catch (error) {
      setSaveState("error");
      setSaveMessage(getErrorMessage(error, "Could not submit course for approval."));
    }
  }

  return (
    <div className="instructor-shell min-h-screen bg-[#F5F7FA] text-[#1D2026]">
      <div className="flex min-h-screen">
        <InstructorSidebar activeItem={isEditMode ? "courses" : "create-course"} />

        <main className="min-w-0 flex-1">
          <InstructorTopbar user={shellUser} title={isEditMode ? "Edit Course" : "Create New Course"} />

          <div className="mx-auto flex w-full max-w-[1640px] flex-col gap-6 px-5 py-6 sm:px-8 2xl:px-10">
            <section className="rounded-[18px] bg-white p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-[#564FFD]">
                    <BadgeCheck className="size-4" />
                    {isEditMode ? "Course editor" : "Guided course creation"}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.3px] text-[#1D2026]">
                    {isEditMode ? `Edit ${basics.title}` : active.label}
                  </h1>
                  <p className="mt-2 max-w-[820px] text-sm leading-6 text-[#6E7485]">
                    {isEditMode
                      ? "Update course details, curriculum, lesson materials, and media before submitting again."
                      : "Build the course draft, organize the curriculum, add lesson materials, upload media, and submit when it is ready."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void saveDraft()}
                    disabled={saveState === "saving" || saveState === "submitting"}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#E9EAF0] bg-white px-5 text-sm font-semibold text-[#4E5566] transition hover:border-[#D8D6FF] hover:text-[#564FFD] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="size-4" />
                    {saveState === "saving" ? "Saving..." : "Save draft"}
                  </button>
                  <button
                    type="button"
                    onClick={activeIndex === steps.length - 1 ? () => void submitForApproval() : goNext}
                    disabled={saveState === "saving" || saveState === "submitting"}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#564FFD] px-5 text-sm font-semibold text-white transition hover:bg-[#453FCA] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {activeIndex === steps.length - 1 ? (saveState === "submitting" ? "Submitting..." : "Submit for approval") : "Continue"}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
              {saveMessage ? (
                <p className={cn("mt-4 rounded-[14px] px-4 py-3 text-sm", saveState === "error" ? "bg-[#FFF5F0] text-[#E34444]" : "bg-[#E1F7E3] text-[#198C27]")}>
                  {saveMessage}
                </p>
              ) : null}
            </section>

            <WizardRail activeStep={activeStep} setActiveStep={setActiveStep} />
            <ReadinessPanel sections={sections} courseImages={courseImages} activeStep={activeStep} />

            <section className="rounded-[18px] bg-white p-6">
                <div className="mb-6 border-b border-[#E9EAF0] pb-5">
                  <div>
                    <p className="text-sm font-medium text-[#564FFD]">Step {activeIndex + 1} of {steps.length}</p>
                    <h2 className="mt-1 text-2xl font-semibold text-[#1D2026]">{active.label}</h2>
                    <p className="mt-1 text-sm text-[#8C94A3]">{active.description}</p>
                  </div>
                </div>

                <StepBody
                  activeStep={activeStep}
                  basics={basics}
                  setBasics={setBasics}
                  sections={sections}
                  setSections={setSections}
                  courseImages={courseImages}
                  setCourseImages={setCourseImages}
                  onRemovePersistedImage={queuePersistedImageRemoval}
                  selectedSectionId={selectedSectionId}
                  setSelectedSectionId={setSelectedSectionId}
                  selectedLessonId={selectedLessonId}
                  setSelectedLessonId={setSelectedLessonId}
                />

                <div className="mt-6 flex flex-col gap-3 border-t border-[#E9EAF0] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={activeIndex === 0}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] border border-[#E9EAF0] px-5 text-sm font-semibold text-[#4E5566] transition hover:border-[#D8D6FF] hover:text-[#564FFD] disabled:opacity-40"
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={activeIndex === steps.length - 1 ? () => void submitForApproval() : goNext}
                    disabled={saveState === "saving" || saveState === "submitting"}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#564FFD] px-5 text-sm font-semibold text-white transition hover:bg-[#453FCA] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {activeIndex === steps.length - 1 ? (saveState === "submitting" ? "Submitting..." : "Submit for approval") : "Next step"}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </section>

            <InstructorFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
