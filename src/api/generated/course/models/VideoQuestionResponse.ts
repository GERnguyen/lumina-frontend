/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VideoOptionResponse } from './VideoOptionResponse';
export type VideoQuestionResponse = {
    id?: string;
    questionText?: string;
    questionType?: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
    timestampSeconds?: number;
    options?: Array<VideoOptionResponse>;
};

