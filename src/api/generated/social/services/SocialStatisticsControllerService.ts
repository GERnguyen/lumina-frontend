/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCourseQnAStatisticsResponse } from '../models/ApiResponseCourseQnAStatisticsResponse';
import type { ApiResponseReportStatisticsOverviewResponse } from '../models/ApiResponseReportStatisticsOverviewResponse';
import type { ApiResponseReviewStatisticsResponse } from '../models/ApiResponseReviewStatisticsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SocialStatisticsControllerService {
    /**
     * Get course review statistics
     * @returns ApiResponseReviewStatisticsResponse OK
     * @throws ApiError
     */
    public static getReviewStatistics({
        courseId,
    }: {
        courseId: string,
    }): CancelablePromise<ApiResponseReviewStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reviews/statistics/courses/{courseId}',
            path: {
                'courseId': courseId,
            },
        });
    }
    /**
     * Get report statistics overview
     * @returns ApiResponseReportStatisticsOverviewResponse OK
     * @throws ApiError
     */
    public static getReportOverview({
        groupBy,
        startDate,
        endDate,
    }: {
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseReportStatisticsOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports/statistics/overview',
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get course QnA statistics
     * @returns ApiResponseCourseQnAStatisticsResponse OK
     * @throws ApiError
     */
    public static getCourseQnAStatistics({
        courseId,
        groupBy,
        startDate,
        endDate,
    }: {
        courseId: string,
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseCourseQnAStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/course-qna/statistics/courses/{courseId}',
            path: {
                'courseId': courseId,
            },
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
}
