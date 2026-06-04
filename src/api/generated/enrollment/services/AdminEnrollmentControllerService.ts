/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseUserEnrollmentSummaryResponse } from '../models/ApiResponseUserEnrollmentSummaryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminEnrollmentControllerService {
    /**
     * @returns ApiResponseUserEnrollmentSummaryResponse OK
     * @throws ApiError
     */
    public static getUserSummary({
        userId,
    }: {
        userId: string,
    }): CancelablePromise<ApiResponseUserEnrollmentSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/enrollments/admin/users/{userId}/summary',
            path: {
                'userId': userId,
            },
        });
    }
}
