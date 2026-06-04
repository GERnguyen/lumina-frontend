/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateQuizOptionRequest } from './UpdateQuizOptionRequest';
export type UpdateQuizQuestionRequest = {
    questionText: string;
    scoringMethod: 'ALL_OR_NOTHING' | 'PARTIAL_CREDIT' | 'NEGATIVE_MARK';
    options?: Array<UpdateQuizOptionRequest>;
};

