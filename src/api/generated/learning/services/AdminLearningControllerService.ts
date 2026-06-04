/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCoursesProgressSummaryResponse } from '../models/ApiResponseCoursesProgressSummaryResponse';
import type { ApiResponseListCourseProgressResponse } from '../models/ApiResponseListCourseProgressResponse';
import type { ApiResponseListLearningActivityByTimeResponse } from '../models/ApiResponseListLearningActivityByTimeResponse';
import type { ApiResponseUserLearningSummaryResponse } from '../models/ApiResponseUserLearningSummaryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminLearningControllerService {
    /**
     * @returns ApiResponseUserLearningSummaryResponse OK
     * @throws ApiError
     */
    public static getUserSummary({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<ApiResponseUserLearningSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/admin/users/{userId}/summary',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @returns ApiResponseListCourseProgressResponse OK
     * @throws ApiError
     */
    public static getUserCourseProgress({
        userId,
        courseIds,
    }: {
        userId: string,
        courseIds: Array<string>,
    }): CancelablePromise<ApiResponseListCourseProgressResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/admin/users/{userId}/course-progress',
            path: {
                'userId': userId,
            },
            query: {
                'courseIds': courseIds,
            },
        });
    }
    /**
     * @returns ApiResponseListLearningActivityByTimeResponse OK
     * @throws ApiError
     */
    public static getUserActivitySeries({
        userId,
        groupBy,
        startDate,
        endDate,
    }: {
        userId: string,
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseListLearningActivityByTimeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/admin/users/{userId}/activity/series',
            path: {
                'userId': userId,
            },
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * @returns ApiResponseCoursesProgressSummaryResponse OK
     * @throws ApiError
     */
    public static getCoursesProgressSummary({
        courseIds,
    }: {
        courseIds: Array<string>,
    }): CancelablePromise<ApiResponseCoursesProgressSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/admin/courses/progress-summary',
            query: {
                'courseIds': courseIds,
            },
        });
    }
}
