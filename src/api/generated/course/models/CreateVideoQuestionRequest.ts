/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateVideoOptionRequest } from './CreateVideoOptionRequest';
export type CreateVideoQuestionRequest = {
    questionText: string;
    questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
    timestampSeconds: number;
    options: Array<CreateVideoOptionRequest>;
};

