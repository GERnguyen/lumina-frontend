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

interface QuizLessonEditorProps {
  courseId: string;
  lessonId: string;
}

export default function QuizLessonEditor({ courseId, lessonId }: QuizLessonEditorProps) {
  // Settings states
  const [numberOfQuestionPerQuizSession, setNumberOfQuestionPerQuizSession] = useState(5);
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
  const [questionType, setQuestionType] = useState<"SINGLE_CHOICE" | "MULTI_CHOICE" | "SHORT_TEXT" | "ESSAY">("SINGLE_CHOICE");
  const [scoringMethod, setScoringMethod] = useState<"ALL_OR_NOTHING" | "PARTIAL_CREDIT" | "NEGATIVE_MARK">("ALL_OR_NOTHING");
  const [options, setOptions] = useState<CreateQuizOptionRequest[]>([
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);

  const fetchQuizDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await QuizLessonApi.getQuizByLessonId(courseId, lessonId);
      if (res?.data) {
        setNumberOfQuestionPerQuizSession(res.data.numberOfQuestionPerQuizSession || 5);
        setMaxAttempt(res.data.maxAttempt);
        setDuration(res.data.duration);
        setIsReviewAllowed(res.data.isReviewAllowed || false);
        setIsShowAnswersOnReview(res.data.isShowAnswersOnReview || false);
        setShuffleQuestions(res.data.shuffleQuestions || false);
        setShuffleOptions(res.data.shuffleOptions || false);
        setScoringMode(res.data.scoringMode || "HIGHEST");
        setQuestions(res.data.questions || []);
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      console.error("Failed to load quiz details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizDetails();
  }, [courseId, lessonId]);

  // Save general settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      numberOfQuestionPerQuizSession,
      maxAttempt: maxAttempt || undefined,
      duration: duration || undefined,
      isReviewAllowed,
      setIsShowAnswersOnReview,
      isShowAnswersOnReview,
      shuffleQuestions,
      shuffleOptions,
      scoringMode,
      questions: [],
    };

    try {
      try {
        await QuizLessonApi.updateQuizSettings(courseId, lessonId, payload);
      } catch (err) {
        await QuizLessonApi.createQuizLesson(courseId, lessonId, payload);
      }
      setSuccessMsg("Quiz configurations updated successfully!");
    } catch (err: any) {
      console.error("Failed to save quiz settings:", err);
      setError(err?.message || "Could not save settings.");
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

  // Save / Add Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    if (["SINGLE_CHOICE", "MULTI_CHOICE"].includes(questionType)) {
      if (options.some((o) => !o.optionText.trim())) {
        alert("Please fill in option labels.");
        return;
      }
      if (!options.some((o) => o.isCorrect)) {
        alert("Mark at least one option as correct.");
        return;
      }
    }

    setSavingQuestion(true);
    const body = {
      questionText,
      questionType,
      scoringMethod,
      options: ["SHORT_TEXT", "ESSAY"].includes(questionType) ? [] : options,
    };

    try {
      if (editingQuestionId) {
        await QuizQuestionApi.updateQuestion(courseId, lessonId, editingQuestionId, body);
        setSuccessMsg("Quiz question updated.");
      } else {
        await QuizQuestionApi.addQuestion(courseId, lessonId, body);
        setSuccessMsg("Quiz question created.");
      }
      startEditQuestion(); // Reset form
      const res = await QuizQuestionApi.getQuestions(courseId, lessonId);
      if (res?.data) {
        setQuestions(res.data);
      }
    } catch (err: any) {
      console.error("Failed to save question:", err);
      setError(err?.message || "Could not save question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    setError(null);
    setSuccessMsg(null);
    try {
      await QuizQuestionApi.deleteQuestion(courseId, lessonId, qId);
      setQuestions(questions.filter((q) => q.id !== qId));
      setSuccessMsg("Question deleted.");
    } catch (err: any) {
      console.error("Failed to delete question:", err);
      setError(err?.message || "Could not delete question.");
    }
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
                Save Configurations
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
                    { label: "📝 Essay Response", value: "ESSAY" },
                  ]}
                  value={questionType}
                  onValueChange={(value) => {
                    const newType = value as typeof questionType;
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
                  {editingQuestionId ? "Update Question" : "Add Question"}
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
                        <ul className="mt-3 space-y-1.5 pl-6 list-disc text-sm text-gray-500 font-medium">
                          {q.options.map((opt) => (
                            <li key={opt.id} className={opt.isCorrect ? "text-emerald-600 font-bold" : ""}>
                              {opt.optionText} {opt.isCorrect && "✓"}
                            </li>
                          ))}
                        </ul>
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
