/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseUserStatisticsOverviewResponse } from '../models/ApiResponseUserStatisticsOverviewResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserStatisticsControllerService {
    /**
     * Get user statistics overview
     * @returns ApiResponseUserStatisticsOverviewResponse OK
     * @throws ApiError
     */
    public static getOverview({
        groupBy,
        startDate,
        endDate,
    }: {
        groupBy?: 'MONTH' | 'DAY',
        startDate?: string,
        endDate?: string,
    }): CancelablePromise<ApiResponseUserStatisticsOverviewResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/statistics/overview',
            query: {
                'groupBy': groupBy,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
}
