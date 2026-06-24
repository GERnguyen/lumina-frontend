"use client";

import React, { useState, useEffect } from "react";
import { QuizLessonApi, QuizQuestionApi } from "@/services/api/course-api";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { InstructorSwitch } from "@/components/ui/shared/InstructorSwitch";
import { Checkbox, Input, Select } from "@/components/ui/shared";
import {
  HelpCircle,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import type { QuizLessonResponse, QuizQuestionResponse, CreateQuizOptionRequest } from "@/types";
import { useToastStore } from "@/stores/toast-store";


interface QuizLessonEditorProps {
  courseId: string;
  lessonId: string;
}

export default function QuizLessonEditor({ courseId, lessonId }: QuizLessonEditorProps) {
  const addToast = useToastStore((state) => state.addToast);
  const [quizData, setQuizData] = useState<QuizLessonResponse | null>(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  // Settings states
  const [numberOfQuestionPerQuizSession, setNumberOfQuestionPerQuizSession] = useState(3);
  const [maxAttempt, setMaxAttempt] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [isReviewAllowed, setIsReviewAllowed] = useState(true);
  const [isShowAnswersOnReview, setIsShowAnswersOnReview] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [scoringMode, setScoringMode] = useState<"HIGHEST" | "LATEST" | "AVERAGE" | "FIRST">("HIGHEST");

  // Questions list
  const [questions, setQuestions] = useState<QuizQuestionResponse[]>([]);

  // Editor states
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [syncingQuiz, setSyncingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Question Form states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"SINGLE_CHOICE" | "MULTI_CHOICE" | "SHORT_TEXT" | "MATCHING" | "ORDERING">("SINGLE_CHOICE");
  const [scoringMethod, setScoringMethod] = useState<"ALL_OR_NOTHING" | "PARTIAL_CREDIT" | "NEGATIVE_MARK">("ALL_OR_NOTHING");
  const [options, setOptions] = useState<CreateQuizOptionRequest[]>([
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);

  const fetchQuizDetails = async () => {
    setLoading(true);
    setError(null);
    setDeletedQuestionIds([]); // Reset deleted tracker
    try {
      const res = await QuizLessonApi.getQuizByLessonId(courseId, lessonId);
      if (res?.data) {
        setHasQuiz(true);
        setNumberOfQuestionPerQuizSession(res.data.numberOfQuestionPerQuizSession || 3);
        setMaxAttempt(res.data.maxAttempt);
        setDuration(res.data.duration);
        setIsReviewAllowed(res.data.isReviewAllowed ?? true);
        setIsShowAnswersOnReview(res.data.isShowAnswersOnReview ?? true);
        setShuffleQuestions(res.data.shuffleQuestions || false);
        setShuffleOptions(res.data.shuffleOptions || false);
        setScoringMode(res.data.scoringMode || "HIGHEST");
        setQuestions(res.data.questions || []);
      } else {
        setHasQuiz(false);
      }
    } catch (err: any) {
      console.warn("Quiz not found or failed to load:", err);
      setHasQuiz(false);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
  }, [courseId, lessonId]);

  // Save general settings AND all local questions (creates or updates the quiz)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setError(null);
    setSuccessMsg(null);

    // Validate that we have at least 1 question
    if (questions.length === 0) {
      addToast("Please add at least one question to the quiz.", "warning", "Validation Error");
      setSavingSettings(false);
      return;
    }

    const mappedQuestions = questions.map((q) => ({
      questionText: q.questionText || "",
      questionType: q.questionType as any,
      scoringMethod: q.scoringMethod as any,
      options: (q.options || []).map((o) => ({
        optionText: o.optionText || "",
        isCorrect: o.isCorrect || false,
        optionOrder: o.optionOrder,
        matchText: o.matchText,
      })),
    }));

    try {
      if (!hasQuiz) {
        // Create the quiz with configurations AND all local questions
        const createPayload = {
          numberOfQuestionPerQuizSession,
          maxAttempt: maxAttempt || undefined,
          duration: duration || undefined,
          isReviewAllowed,
          isShowAnswersOnReview,
          shuffleQuestions,
          shuffleOptions,
          scoringMode,
          questions: mappedQuestions,
        };

        await QuizLessonApi.createQuizLesson(courseId, lessonId, createPayload);
        setHasQuiz(true);
        addToast("Quiz and questions created successfully!", "success", "Quiz Created");
      } else {
        // Update quiz configurations
        const settingsPayload = {
          numberOfQuestionPerQuizSession,
          maxAttempt: maxAttempt || undefined,
          duration: duration || undefined,
          isReviewAllowed,
          isShowAnswersOnReview,
          shuffleQuestions,
          shuffleOptions,
          scoringMode,
        };

        await QuizLessonApi.updateQuizSettings(courseId, lessonId, settingsPayload);

        // Diff and sync questions
        // 1. Delete questions that were removed locally
        const deletePromises = deletedQuestionIds.map((id) =>
          QuizQuestionApi.deleteQuestion(courseId, lessonId, id)
        );

        // 2. Add or Update questions
        const savePromises = questions.map((q) => {
          const body = {
            questionText: q.questionText || "",
            questionType: q.questionType as any,
            scoringMethod: q.scoringMethod as any,
            options: (q.options || []).map((o) => ({
              optionText: o.optionText || "",
              isCorrect: o.isCorrect || false,
              optionOrder: o.optionOrder,
              matchText: o.matchText,
            })),
          };

          if (q.id && !q.id.startsWith("temp_")) {
            // Update existing question
            return QuizQuestionApi.updateQuestion(courseId, lessonId, q.id, body);
          } else {
            // Add new question
            return QuizQuestionApi.addQuestion(courseId, lessonId, body);
          }
        });

        await Promise.all([...deletePromises, ...savePromises]);
        setDeletedQuestionIds([]); // Clear deleted list
        addToast("Quiz changes saved successfully!", "success", "Quiz Saved");
      }

      setSuccessMsg("Quiz configurations & questions saved successfully!");
      // Reload quiz details to sync with DB IDs
      await fetchQuizDetails();
    } catch (err: any) {
      console.error("Failed to save quiz:", err);
      setError(err?.message || "Could not save quiz settings/questions.");
      addToast(err?.message || "Failed to save quiz", "error", "Error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Sync Quiz Changes to backend learning service
  const handleSyncQuiz = async () => {
    setSyncingQuiz(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await QuizLessonApi.syncQuiz(courseId, lessonId, {
        triggerRegrade: true,
        changeReason: "Draft updates synced by instructor",
      });
      setSuccessMsg("Quiz published & synced to learning services!");
    } catch (err: any) {
      console.error("Failed to sync quiz:", err);
      setError(err?.message || "Sync failed. Ensure you have configured the settings and added questions.");
    } finally {
      setSyncingQuiz(false);
    }
  };

  // Question Builder options management
  const addOptionRow = () => {
    setOptions([...options, { optionText: "", isCorrect: false }]);
  };

  const removeOptionRow = (index: number) => {
    if (options.length <= 1) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof CreateQuizOptionRequest, val: any) => {
    const updated = [...options];
    if (field === "isCorrect" && questionType === "SINGLE_CHOICE") {
      updated.forEach((o, i) => {
        o.isCorrect = i === index ? val : false;
      });
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setOptions(updated);
  };

  // Reset Question Form
  const startEditQuestion = (q?: QuizQuestionResponse) => {
    setError(null);
    setSuccessMsg(null);
    if (q) {
      setEditingQuestionId(q.id || null);
      setQuestionText(q.questionText || "");
      setQuestionType((q.questionType as any) || "SINGLE_CHOICE");
      setScoringMethod((q.scoringMethod as any) || "ALL_OR_NOTHING");
      setOptions(
        (q.options || []).map((o) => ({
          optionText: o.optionText || "",
          isCorrect: o.isCorrect || false,
          optionOrder: o.optionOrder,
          matchText: o.matchText,
        }))
      );
    } else {
      setEditingQuestionId(null);
      setQuestionText("");
      setQuestionType("SINGLE_CHOICE");
      setScoringMethod("ALL_OR_NOTHING");
      setOptions([
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ]);
    }
  };

  // Save / Add Question (Locally in-memory)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    if (["SINGLE_CHOICE", "MULTI_CHOICE", "SHORT_TEXT", "ORDERING", "MATCHING"].includes(questionType)) {
      if (options.some((o) => !o.optionText.trim())) {
        addToast("Please fill in all options/items.", "warning", "Validation Error");
        return;
      }
      if (questionType === "MATCHING" && options.some((o) => !o.matchText?.trim())) {
        addToast("Please fill in all matching targets.", "warning", "Validation Error");
        return;
      }
      if (["SINGLE_CHOICE", "MULTI_CHOICE"].includes(questionType) && !options.some((o) => o.isCorrect)) {
        addToast("Mark at least one option as correct.", "warning", "Validation Error");
        return;
      }
    }

    const questionBody: QuizQuestionResponse = {
      id: editingQuestionId || undefined,
      questionText,
      questionType,
      scoringMethod,
      options: options.map((opt, idx) => ({
        optionText: opt.optionText,
        isCorrect: ["SHORT_TEXT", "MATCHING", "ORDERING"].includes(questionType) ? true : opt.isCorrect,
        optionOrder: questionType === "ORDERING" ? idx + 1 : undefined,
        matchText: questionType === "MATCHING" ? opt.matchText : undefined,
      })),
    };

    if (editingQuestionId) {
      // Edit local list in place
      setQuestions(questions.map((q) => (q.id === editingQuestionId ? questionBody : q)));
    } else {
      // Add a new question to the local list with a temporary ID
      const tempId = `temp_${Date.now()}`;
      setQuestions([...questions, { ...questionBody, id: tempId }]);
    }

    startEditQuestion(); // Reset form
  };

  // Delete Question (Locally in-memory)
  const handleDeleteQuestion = (qId: string) => {
    if (!confirm("Are you sure you want to remove this question locally?")) return;

    setError(null);
    setSuccessMsg(null);
    if (!qId.startsWith("temp_")) {
      // Keep track of backend questions to delete on save
      setDeletedQuestionIds([...deletedQuestionIds, qId]);
    }
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  if (loading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-2">
        <Loader2 className="size-6 animate-spin text-primary-600" />
        <span className="text-[11px] text-gray-400 font-bold">Loading quiz settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 text-red-600 p-4 text-xs font-semibold border border-red-100 animate-in slide-in-from-top-2">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg bg-emerald-50 text-emerald-600 p-4 text-xs font-semibold border border-emerald-100 animate-in slide-in-from-top-2">
          {successMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quiz General Settings */}
        <div className="lg:col-span-1 space-y-5">
          <form onSubmit={handleSaveSettings} className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3.5">
              <h3 className="text-base font-bold text-gray-900">Quiz Configurations</h3>
              <button
                type="button"
                onClick={handleSyncQuiz}
                disabled={syncingQuiz || questions.length === 0}
                className="flex cursor-pointer items-center space-x-1.5 rounded-lg bg-primary-50 px-3 py-2.5 text-sm font-medium text-primary-600 transition-all hover:bg-primary-100 disabled:pointer-events-none disabled:opacity-40"
                title="Sync quiz changes to learning service"
              >
                {syncingQuiz ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                <span>Publish</span>
              </button>
            </div>

            <Input
              id="session-size"
              label="Questions Per Session"
              type="number"
              value={numberOfQuestionPerQuizSession}
              onChange={(e) => setNumberOfQuestionPerQuizSession(Number(e.target.value))}
              min="1"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="max-attempts"
                label="Max Attempts"
                type="number"
                value={maxAttempt || ""}
                placeholder="Unlimited"
                onChange={(e) => setMaxAttempt(e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                id="quiz-duration"
                label="Duration (mins)"
                type="number"
                value={duration || ""}
                placeholder="No limit"
                onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <Select
              id="scoring-mode"
              label="Scoring Mode"
              options={[
                { label: "Highest Score", value: "HIGHEST" },
                { label: "Latest Attempt", value: "LATEST" },
                { label: "Average Attempts", value: "AVERAGE" },
                { label: "First Attempt", value: "FIRST" },
              ]}
              value={scoringMode}
              onValueChange={(value) => setScoringMode(value as typeof scoringMode)}
              className="w-full max-w-full"
            />

            <div className="space-y-4 pt-3.5 border-t border-gray-200">
              <InstructorSwitch
                checked={isReviewAllowed}
                onChange={setIsReviewAllowed}
                label="Allow Review"
                description="Allow students to view attempts details."
              />
              <InstructorSwitch
                checked={isShowAnswersOnReview}
                onChange={setIsShowAnswersOnReview}
                label="Show Answers"
                description="Display answers in review details."
              />
              <InstructorSwitch
                checked={shuffleQuestions}
                onChange={setShuffleQuestions}
                label="Shuffle Questions"
              />
              <InstructorSwitch
                checked={shuffleOptions}
                onChange={setShuffleOptions}
                label="Shuffle Answers"
              />
            </div>

            <div className="pt-4">
              <InstructorButton type="submit" loading={savingSettings} size="md" icon={Save} className="w-full px-3 py-2.5 text-sm font-medium">
                {hasQuiz ? "Save Quiz Changes" : "Create Quiz"}
              </InstructorButton>
            </div>
          </form>
        </div>

        {/* Quiz Questions List & Designer */}
        <div className="lg:col-span-2 space-y-6">

          {/* Question Form */}
          <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
            <h3 className="text-base font-bold text-gray-900">
              {editingQuestionId ? "Modify Question" : "Add Quiz Question"}
            </h3>

            {!hasQuiz && (
              <div className="rounded-lg bg-amber-50/50 border border-amber-200 p-4 text-xs font-bold text-amber-850 leading-relaxed">
                ⚠️ This quiz has not been created yet. Customize settings on the left, add at least one question below, and then click <strong>Create Quiz</strong> to save.
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              <Input
                id="q-text"
                label="Question Text / Prompt"
                placeholder="Type the question content here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  id="q-type"
                  label="Question Type"
                  options={[
                    { label: "🔘 Single Choice", value: "SINGLE_CHOICE" },
                    { label: "☑️ Multiple Choice", value: "MULTI_CHOICE" },
                    { label: "✍️ Short Text Fill-in", value: "SHORT_TEXT" },
                    { label: "↔️ Matching Pairs", value: "MATCHING" },
                    { label: "🔢 Ordering Sequence", value: "ORDERING" },
                  ]}
                  value={questionType}
                  onValueChange={(value) => {
                    const newType = value as any;
                    setQuestionType(newType);
                    if (newType === "SINGLE_CHOICE") {
                      const opt = [...options];
                      let foundCorrect = false;
                      opt.forEach((o) => {
                        if (o.isCorrect && !foundCorrect) {
                          foundCorrect = true;
                        } else {
                          o.isCorrect = false;
                        }
                      });
                      setOptions(opt);
                    } else if (newType === "SHORT_TEXT") {
                      setOptions([{ optionText: "", isCorrect: true }]);
                    } else if (newType === "MATCHING") {
                      setOptions([
                        { optionText: "", matchText: "", isCorrect: true },
                        { optionText: "", matchText: "", isCorrect: true },
                      ]);
                    } else if (newType === "ORDERING") {
                      setOptions([
                        { optionText: "", optionOrder: 1, isCorrect: true },
                        { optionText: "", optionOrder: 2, isCorrect: true },
                      ]);
                    }
                  }}
                  className="w-full max-w-full"
                />

                <Select
                  id="q-scoring"
                  label="Scoring Method"
                  options={[
                    { label: "All or Nothing", value: "ALL_OR_NOTHING" },
                    { label: "Partial Credit", value: "PARTIAL_CREDIT" },
                    { label: "Negative marking", value: "NEGATIVE_MARK" },
                  ]}
                  value={scoringMethod}
                  onValueChange={(value) => setScoringMethod(value as typeof scoringMethod)}
                  className="w-full max-w-full"
                />
              </div>

              {/* Options lists for Choice Questions */}
              {["SINGLE_CHOICE", "MULTI_CHOICE"].includes(questionType) && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800">Option Choices & Answers</label>
                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5">
                        <Checkbox
                          checked={opt.isCorrect}
                          onCheckedChange={(checked) => updateOption(idx, "isCorrect", checked === true)}
                        />
                        <Input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt.optionText}
                          onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="flex items-center space-x-1 text-sm font-medium text-primary-600 cursor-pointer hover:underline"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Option Choice</span>
                  </button>
                </div>
              )}

              {/* Options for Short Text (Fill-in-the-blank) Correct Answers */}
              {questionType === "SHORT_TEXT" && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800">Acceptable Correct Answers</label>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    Enter one or more acceptable answers. The student's answer must match one of these (evaluated case-insensitively).
                  </p>
                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5">
                        <Input
                          type="text"
                          placeholder={`Correct Answer Alternative ${idx + 1}`}
                          value={opt.optionText}
                          onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                          required
                        />
                        {options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOptionRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="flex items-center space-x-1 text-sm font-medium text-primary-600 cursor-pointer hover:underline"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Acceptable Answer</span>
                  </button>
                </div>
              )}

              {/* Options for Matching Pairs */}
              {questionType === "MATCHING" && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800">Matching Pairs</label>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    Enter matching items. The student will be asked to match each item on the left with its correct counterpart on the right.
                  </p>
                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-3.5">
                        <Input
                          type="text"
                          placeholder={`Left Item ${idx + 1}`}
                          value={opt.optionText}
                          onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                          required
                        />
                        <span className="text-gray-400 font-bold text-xs select-none">matches</span>
                        <Input
                          type="text"
                          placeholder={`Right Match ${idx + 1}`}
                          value={opt.matchText || ""}
                          onChange={(e) => updateOption(idx, "matchText", e.target.value)}
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="flex items-center space-x-1 text-sm font-medium text-primary-600 cursor-pointer hover:underline"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Matching Pair</span>
                  </button>
                </div>
              )}

              {/* Options for Ordering Sequence */}
              {questionType === "ORDERING" && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-semibold text-gray-800">Sequence Items (in correct order)</label>
                  <p className="text-[11px] text-gray-500 font-medium leading-normal">
                    Enter items in their correct sequence (first to last). They will be shuffled when presented to the student.
                  </p>
                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5">
                        <span className="text-xs font-bold text-gray-400 w-6 select-none">{idx + 1}.</span>
                        <Input
                          type="text"
                          placeholder={`Sequence Item ${idx + 1}`}
                          value={opt.optionText}
                          onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                          required
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOptionRow(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="flex items-center space-x-1 text-sm font-medium text-primary-600 cursor-pointer hover:underline"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Sequence Item</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2.5 pt-3.5 border-t border-gray-200">
                {editingQuestionId && (
                  <button
                    type="button"
                    onClick={() => startEditQuestion()}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                  >
                    Cancel Edit
                  </button>
                )}
                <InstructorButton type="submit" loading={savingQuestion} size="md" icon={editingQuestionId ? Save : Plus} className="px-3 py-2.5 text-sm font-medium">
                  {editingQuestionId ? "Apply Question Changes" : "Add Question to List"}
                </InstructorButton>
              </div>
            </form>
          </div>

          {/* Active Questions list */}
          <div className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
            <h3 className="text-base font-bold text-gray-900">Questions in Quiz ({questions.length})</h3>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {questions.length > 0 ? (
                questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300"
                  >
                    <div>
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                        <span className="text-xs font-black text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md select-none">
                          Question {idx + 1}
                        </span>
                        <span className="text-xs font-black text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-md select-none">
                          {q.questionType}
                        </span>
                        <span className="text-xs font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md select-none">
                          Scoring: {q.scoringMethod}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-3">{q.questionText}</p>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-xs font-bold text-gray-400 select-none">
                            {q.questionType === "SHORT_TEXT"
                              ? "Acceptable Answers:"
                              : q.questionType === "MATCHING"
                              ? "Matching Pairs:"
                              : q.questionType === "ORDERING"
                              ? "Correct Sequence (First to Last):"
                              : "Option Choices:"}
                          </p>
                          {q.questionType === "ORDERING" ? (
                            <ol className="pl-6 list-decimal text-sm text-emerald-600 font-bold space-y-1.5">
                              {[...q.options]
                                .sort((a, b) => (a.optionOrder || 0) - (b.optionOrder || 0))
                                .map((opt) => (
                                  <li key={opt.id}>{opt.optionText}</li>
                                ))}
                            </ol>
                          ) : q.questionType === "MATCHING" ? (
                            <ul className="pl-6 list-disc text-sm text-emerald-600 font-bold space-y-1.5">
                              {q.options.map((opt) => (
                                <li key={opt.id}>
                                  {opt.optionText} <span className="text-gray-400 font-medium mx-1.5">➔</span> {opt.matchText}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <ul className="pl-6 list-disc text-sm text-gray-500 font-medium space-y-1.5">
                              {q.options.map((opt) => (
                                <li
                                  key={opt.id}
                                  className={opt.isCorrect || q.questionType === "SHORT_TEXT" ? "text-emerald-600 font-bold" : ""}
                                >
                                  {opt.optionText} {(opt.isCorrect || q.questionType === "SHORT_TEXT") && "✓"}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => startEditQuestion(q)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50/50 rounded-lg cursor-pointer"
                        title="Edit Question"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => q.id && handleDeleteQuestion(q.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-sm font-bold select-none bg-gray-50/50 rounded-lg border border-gray-200">
                  <HelpCircle className="size-8 mx-auto text-gray-300 mb-2" />
                  <span>No questions added yet. Use the question form above.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
