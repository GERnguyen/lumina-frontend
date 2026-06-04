/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReviewReactionResponse } from './ReviewReactionResponse';
import type { ReviewReplyDto } from './ReviewReplyDto';
export type ReviewResponse = {
    id?: string;
    userId?: string;
    courseId?: string;
    content?: string;
    rating?: number;
    reply?: ReviewReplyDto;
    reactions?: Array<ReviewReactionResponse>;
};

