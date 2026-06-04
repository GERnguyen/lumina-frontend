/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseObject } from '../models/ApiResponseObject';
import type { CreateReportReviewRequest } from '../models/CreateReportReviewRequest';
import type { CreateReviewReactionRequest } from '../models/CreateReviewReactionRequest';
import type { CreateReviewReplyRequest } from '../models/CreateReviewReplyRequest';
import type { CreateReviewRequest } from '../models/CreateReviewRequest';
import type { PaginatedApiResponseReviewResponse } from '../models/PaginatedApiResponseReviewResponse';
import type { UpdateReviewReplyRequest } from '../models/UpdateReviewReplyRequest';
import type { UpdateReviewRequest } from '../models/UpdateReviewRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReviewControllerService {
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static updateReview({
        reviewId,
        requestBody,
    }: {
        reviewId: string,
        requestBody: UpdateReviewRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/reviews/{reviewId}',
            path: {
                'reviewId': reviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static deleteReview({
        reviewId,
    }: {
        reviewId: string,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/reviews/{reviewId}',
            path: {
                'reviewId': reviewId,
            },
        });
    }
    /**
     * Update review reply (Instructor only)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static updateReviewReply({
        replyId,
        requestBody,
    }: {
        replyId: string,
        requestBody: UpdateReviewReplyRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/reviews/replies/{replyId}',
            path: {
                'replyId': replyId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete review reply (Instructor only)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static deleteReviewReply({
        replyId,
    }: {
        replyId: string,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/reviews/replies/{replyId}',
            path: {
                'replyId': replyId,
            },
        });
    }
    /**
     * @returns PaginatedApiResponseReviewResponse OK
     * @throws ApiError
     */
    public static getReviewsByCourseId({
        courseId,
        page = 1,
        size = 10,
        sort,
    }: {
        courseId: string,
        page?: number,
        size?: number,
        sort?: string,
    }): CancelablePromise<PaginatedApiResponseReviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reviews',
            query: {
                'courseId': courseId,
                'page': page,
                'size': size,
                'sort': sort,
            },
        });
    }
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static createReview({
        requestBody,
    }: {
        requestBody: CreateReviewRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/reviews',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static reportReview({
        reviewId,
        requestBody,
    }: {
        reviewId: string,
        requestBody: CreateReportReviewRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/reviews/{reviewId}/report',
            path: {
                'reviewId': reviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reply to review (Instructor only)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static createReviewReply({
        reviewId,
        requestBody,
    }: {
        reviewId: string,
        requestBody: CreateReviewReplyRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/reviews/{reviewId}/replies',
            path: {
                'reviewId': reviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static reactReview({
        reviewId,
        requestBody,
    }: {
        reviewId: string,
        requestBody: CreateReviewReactionRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/reviews/{reviewId}/react',
            path: {
                'reviewId': reviewId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
