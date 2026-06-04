/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateQuizOptionRequest } from './CreateQuizOptionRequest';
export type CreateQuizQuestionRequest = {
    questionText: string;
    questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'SHORT_TEXT' | 'ORDERING' | 'MATCHING' | 'ESSAY';
    scoringMethod: 'ALL_OR_NOTHING' | 'PARTIAL_CREDIT' | 'NEGATIVE_MARK';
    options: Array<CreateQuizOptionRequest>;
};

