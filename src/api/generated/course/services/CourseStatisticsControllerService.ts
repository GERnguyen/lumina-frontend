/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseAdminCourseStatisticsOverviewResponse } from '../models/ApiResponseAdminCourseStatisticsOverviewResponse';
import type { ApiResponseInstructorCourseStatisticsOverviewResponse } from '../models/ApiResponseInstructorCourseStatisticsOverviewResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseStatisticsControllerService {
    /**
     * Get my course statistics overview
     * @returns ApiResponseInstructorCourseStatisticsOverviewResponse OK
     * @throws ApiError
     */
    public static getInstructorOverview({
        groupBy,
        startDate,
        endDate,
    }: {
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseInstructorCourseStatisticsOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/mine/statistics/overview',
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get admin course statistics overview
     * @returns ApiResponseAdminCourseStatisticsOverviewResponse OK
     * @throws ApiError
     */
    public static getAdminOverview({
        groupBy,
        startDate,
        endDate,
    }: {
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseAdminCourseStatisticsOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/courses/statistics/overview',
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
}
