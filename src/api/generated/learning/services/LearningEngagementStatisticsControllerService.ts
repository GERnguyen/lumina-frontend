/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCourseEngagementOverviewResponse } from '../models/ApiResponseCourseEngagementOverviewResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LearningEngagementStatisticsControllerService {
    /**
     * Get instructor course engagement overview
     * @returns ApiResponseCourseEngagementOverviewResponse OK
     * @throws ApiError
     */
    public static getInstructorCourseEngagement({
        courseId,
        groupBy,
        startDate,
        endDate,
    }: {
        courseId: string,
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseCourseEngagementOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/courses/{courseId}/engagement/overview',
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
    /**
     * Get admin course engagement overview
     * @returns ApiResponseCourseEngagementOverviewResponse OK
     * @throws ApiError
     */
    public static getAdminCourseEngagement({
        courseId,
        groupBy,
        startDate,
        endDate,
    }: {
        courseId: string,
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseCourseEngagementOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/admin/courses/{courseId}/engagement/overview',
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
