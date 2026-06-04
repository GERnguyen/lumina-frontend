/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseAdminOverviewResponse } from '../models/ApiResponseAdminOverviewResponse';
import type { ApiResponseCourseStatisticsResponse } from '../models/ApiResponseCourseStatisticsResponse';
import type { ApiResponseDashboardMetricsResponse } from '../models/ApiResponseDashboardMetricsResponse';
import type { ApiResponseInstructorRevenueResponse } from '../models/ApiResponseInstructorRevenueResponse';
import type { ApiResponseInstructorStatisticsResponse } from '../models/ApiResponseInstructorStatisticsResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsControllerService {
    /**
     * Get instructor statistics
     * @returns ApiResponseInstructorStatisticsResponse OK
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
    }): CancelablePromise<ApiResponseInstructorStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/instructor/overview',
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get course specific statistics overview
     * @returns ApiResponseCourseStatisticsResponse OK
     * @throws ApiError
     */
    public static getCourseStatisticsOverview({
        courseId,
        groupBy,
        startDate,
        endDate,
    }: {
        courseId: string,
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseCourseStatisticsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/instructor/courses/{courseId}/overview',
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
     * Get dashboard metrics
     * @returns ApiResponseDashboardMetricsResponse OK
     * @throws ApiError
     */
    public static getDashboardMetrics({
        year,
        month,
    }: {
        year?: number,
        month?: number,
    }): CancelablePromise<ApiResponseDashboardMetricsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/dashboard',
            query: {
                'year': year,
                'month': month,
            },
        });
    }
    /**
     * Get admin overview
     * @returns ApiResponseAdminOverviewResponse OK
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
    }): CancelablePromise<ApiResponseAdminOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/admin/overview',
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get admin instructor revenue series
     * @returns ApiResponseInstructorRevenueResponse OK
     * @throws ApiError
     */
    public static getInstructorRevenueSeries({
        instructorId,
        groupBy,
        startDate,
        endDate,
    }: {
        instructorId: string,
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseInstructorRevenueResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/statistics/admin/instructors/{instructorId}/revenue/series',
            path: {
                'instructorId': instructorId,
            },
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
}
