/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuizOptionResponse } from './QuizOptionResponse';
export type QuizQuestionResponse = {
    id?: string;
    questionText?: string;
    questionType?: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SHORT_TEXT' | 'ORDERING' | 'MATCHING' | 'ESSAY';
    scoringMethod?: 'ALL_OR_NOTHING' | 'PARTIAL_CREDIT' | 'NEGATIVE_MARK';
    needSync?: boolean;
    options?: Array<QuizOptionResponse>;
};

