/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseInstructorCourseSummaryResponse } from '../models/ApiResponseInstructorCourseSummaryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminInstructorControllerService {
    /**
     * @returns ApiResponseInstructorCourseSummaryResponse OK
     * @throws ApiError
     */
    public static getCourseSummary({
        instructorId,
    }: {
        instructorId: string,
    }): CancelablePromise<ApiResponseInstructorCourseSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/instructors/{instructorId}/course-summary',
            path: {
                'instructorId': instructorId,
            },
        });
    }
}
