/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateQuizQuestionRequest } from './CreateQuizQuestionRequest';
export type CreateQuizLessonRequest = {
    numberOfQuestionPerQuizSession: number;
    maxAttempt?: number;
    duration?: number;
    isReviewAllowed: boolean;
    isShowAnswersOnReview: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    scoringMode: 'HIGHEST' | 'LATEST' | 'AVERAGE' | 'FIRST';
    questions: Array<CreateQuizQuestionRequest>;
};

