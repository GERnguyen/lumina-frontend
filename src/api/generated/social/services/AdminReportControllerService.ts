/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { PaginatedApiResponseReport } from '../models/PaginatedApiResponseReport';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminReportControllerService {
    /**
     * @returns PaginatedApiResponseReport OK
     * @throws ApiError
     */
    public static getReports({
        type,
        page = 1,
        size = 10,
        sort,
    }: {
        type?: 'REVIEW' | 'QUESTION' | 'ANSWER',
        page?: number,
        size?: number,
        sort?: string,
    }): CancelablePromise<PaginatedApiResponseReport> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/reports',
            query: {
                'type': type,
                'page': page,
                'size': size,
                'sort': sort,
            },
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static dismissReport({
        reportId,
    }: {
        reportId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/reports/{reportId}/dismiss',
            path: {
                'reportId': reportId,
            },
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteReportedContent({
        reportId,
    }: {
        reportId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/reports/{reportId}/content',
            path: {
                'reportId': reportId,
            },
        });
    }
}
