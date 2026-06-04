/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateQuizLessonRequest = {
    numberOfQuestionPerQuizSession?: number;
    maxAttempt?: number;
    duration?: number;
    isReviewAllowed?: boolean;
    isShowAnswersOnReview?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    scoringMode?: 'HIGHEST' | 'LATEST' | 'AVERAGE' | 'FIRST';
};

