/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedMetadata } from './PaginatedMetadata';
import type { QuestionDto } from './QuestionDto';
export type PaginatedApiResponseQuestionDto = {
    success?: boolean;
    message?: string;
    data?: Array<QuestionDto>;
    meta?: PaginatedMetadata;
};

