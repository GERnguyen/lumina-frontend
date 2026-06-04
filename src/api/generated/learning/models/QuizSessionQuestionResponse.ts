/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuizSessionOptionResponse } from './QuizSessionOptionResponse';
export type QuizSessionQuestionResponse = {
    id?: string;
    quizSessionId?: string;
    questionId?: string;
    questionType?: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SHORT_TEXT' | 'ORDERING' | 'MATCHING' | 'ESSAY';
    scoringMethod?: 'ALL_OR_NOTHING' | 'PARTIAL_CREDIT' | 'NEGATIVE_MARK';
    questionOrder?: number;
    questionText?: string;
    userAnswer?: string;
    correctAnswer?: string;
    score?: number;
    options?: Array<QuizSessionOptionResponse>;
};

