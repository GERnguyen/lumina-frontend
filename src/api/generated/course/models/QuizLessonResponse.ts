/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuizQuestionResponse } from './QuizQuestionResponse';
export type QuizLessonResponse = {
    lessonId?: string;
    numberOfQuestionPerQuizSession?: number;
    maxAttempt?: number;
    duration?: number;
    isReviewAllowed?: boolean;
    isShowAnswersOnReview?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    scoringMode?: 'HIGHEST' | 'LATEST' | 'AVERAGE' | 'FIRST';
    hasPendingSync?: boolean;
    questions?: Array<QuizQuestionResponse>;
};

