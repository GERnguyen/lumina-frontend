"use server";

import { AssignmentApi, CertificateApi, DailyGoalApi, LearningProgressApi, QuizSessionApi, VideoNoteApi, VideoTrackingApi } from "@/services/api/learning-api";
import { CourseApi, VideoQuestionApi } from "@/services/api/course-api";
import { EnrollmentApi } from "@/services/api/enrollment-api";
import type { CreateAssignmentSubmissionRequest, CreateVideoNoteRequest, ChooseQuizAnswerRequest, SetDailyGoalRequest, SubmitQuizSessionRequest, SubmitVideoQuestionRequest, TrackingVideoLessonRequest, UpdateVideoNoteRequest, GradeEssayRequest } from "@/types";
import { revalidatePath } from "next/cache";

export async function setDailyGoalAction(body: SetDailyGoalRequest) {
  try {
    const res = await DailyGoalApi.setDailyGoal(body);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to set daily goal" };
  }
}

export async function editDailyGoalAction(body: SetDailyGoalRequest) {
  try {
    const res = await DailyGoalApi.editDailyGoal(body);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update daily goal" };
  }
}

export async function deleteDailyGoalAction(params: { date?: string; goalType: string; targetItemId?: string }) {
  try {
    const res = await DailyGoalApi.deleteDailyGoal(params);
    revalidatePath("/");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete daily goal" };
  }
}

export async function getDailyGoalsInMonthAction(year: number, month: number) {
  try {
    const res = await DailyGoalApi.getDailyGoalsInMonth({ year, month });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch daily goals" };
  }
}

export async function markItemAsCompleteAction(itemId: string) {
  try {
    const res = await LearningProgressApi.markItemAsComplete(itemId);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to mark item as complete" };
  }
}

export async function getCourseProgressByCourseIdsAction(courseIds: string) {
  try {
    const res = await LearningProgressApi.getCourseProgressByCourseIds(courseIds);
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch course progress" };
  }
}

export async function getMyCourseProgressAction(courseId: string) {
  try {
    const res = await LearningProgressApi.getMyCourseProgress(courseId);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch course progress" };
  }
}

export async function getIncompleteEnrolledLessonsAction() {
  try {
    const enrolledRes = await EnrollmentApi.getEnrolledCourses({ page: 1, size: 50 });
    const courses = enrolledRes.data || [];
    const items = await Promise.all(
      courses
        .filter((course) => course.id)
        .map(async (course) => {
          const [curriculumRes, progressRes] = await Promise.all([
            CourseApi.getReadableCurriculum(course.id!),
            LearningProgressApi.getLearningItemProgressByCourseId(course.id!),
          ]);
          const completedIds = new Set((progressRes.data || []).filter((item) => item.itemId && item.isCompleted).map((item) => item.itemId as string));
          const lessons =
            curriculumRes.data?.sections?.flatMap((section) =>
              (section.lessons || [])
                .filter((lesson) => lesson.id && !completedIds.has(lesson.id))
                .map((lesson) => ({
                  id: lesson.id!,
                  title: lesson.title || "Untitled lesson",
                  type: lesson.lessonType || "VIDEO",
                  sectionTitle: section.title || "Course section",
                })),
            ) || [];
          return {
            id: course.id!,
            title: course.title || "Untitled course",
            lessons,
          };
        }),
    );

    return { success: true, data: items.filter((course) => course.lessons.length) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load unfinished lessons" };
  }
}

export async function createQuizSessionAction(courseId: string, lessonId: string) {
  try {
    const res = await QuizSessionApi.createQuizSession(courseId, lessonId);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to start quiz" };
  }
}

export async function getQuizSessionsAction(lessonId: string) {
  try {
    const res = await QuizSessionApi.getQuizSessions(lessonId, { page: 1, size: 20, sort: "startTime,desc" });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load quiz sessions" };
  }
}

export async function getQuizSessionQuestionsAction(quizSessionId: string) {
  try {
    const res = await QuizSessionApi.getQuizSessionQuestions(quizSessionId, { page: 1, size: 100 });
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load quiz questions" };
  }
}

export async function chooseQuizAnswerAction(quizSessionId: string, body: ChooseQuizAnswerRequest) {
  try {
    const res = await QuizSessionApi.chooseQuizSessionQuestion(quizSessionId, body);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to save answer" };
  }
}

export async function submitQuizSessionAction(quizSessionId: string, body: SubmitQuizSessionRequest) {
  try {
    const res = await QuizSessionApi.submitQuizSession(quizSessionId, body);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to submit quiz" };
  }
}

export async function submitAssignmentAction(assignmentId: string, body: CreateAssignmentSubmissionRequest) {
  try {
    const res = await AssignmentApi.submitAssignment(assignmentId, body);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to submit assignment" };
  }
}

export async function getAssignmentSubmissionAction(assignmentId: string) {
  try {
    const res = await AssignmentApi.getAssignmentSubmission({ assignmentId });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load assignment submission" };
  }
}

export async function applyForCertificateAction(courseId: string) {
  try {
    const res = await CertificateApi.applyForCertificate(courseId);
    revalidatePath(`/learning/${courseId}`);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to request certificate" };
  }
}

export async function getVideoNotesByLessonAction(courseId: string, lessonId: string) {
  try {
    const res = await VideoNoteApi.getNotesByLesson(courseId, lessonId);
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load video notes" };
  }
}

export async function createVideoNoteAction(courseId: string, lessonId: string, body: CreateVideoNoteRequest) {
  try {
    const res = await VideoNoteApi.createNote(courseId, lessonId, body);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create video note" };
  }
}

export async function updateVideoNoteAction(noteId: string, body: UpdateVideoNoteRequest) {
  try {
    const res = await VideoNoteApi.updateNote(noteId, body);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update video note" };
  }
}

export async function deleteVideoNoteAction(noteId: string) {
  try {
    await VideoNoteApi.deleteNote(noteId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete video note" };
  }
}

export async function getVideoQuestionsAction(courseId: string, lessonId: string) {
  try {
    const res = await VideoQuestionApi.getQuestionsByLessonId(courseId, lessonId);
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load video checkpoints" };
  }
}

export async function getVideoQuestionSubmissionsAction(courseId: string, lessonId: string) {
  try {
    const res = await VideoTrackingApi.getVideoQuestionSubmissions(courseId, lessonId);
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to load video checkpoint submissions" };
  }
}

export async function trackVideoProgressAction(courseId: string, lessonId: string, body: TrackingVideoLessonRequest) {
  try {
    const res = await VideoTrackingApi.trackVideoProgress(courseId, lessonId, body);
    revalidatePath(`/learning/${courseId}`);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to track video progress" };
  }
}

export async function submitVideoQuestionAnswerAction(courseId: string, lessonId: string, body: SubmitVideoQuestionRequest) {
  try {
    const res = await VideoTrackingApi.submitVideoQuestionAnswer(courseId, lessonId, body);
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Incorrect answer. Please try again." };
  }
}

export async function gradeQuizEssayAction(sessionId: string, body: GradeEssayRequest) {
  try {
    const res = await QuizSessionApi.gradeEssay(sessionId, body);
    revalidatePath("/learning");
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to grade essay" };
  }
}
