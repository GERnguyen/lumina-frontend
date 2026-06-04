/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { LearningActivityRequest } from '../models/LearningActivityRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LearningActivityControllerService {
    /**
     * Record learning activity heartbeat
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static recordActivity({
        requestBody,
    }: {
        requestBody: LearningActivityRequest,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/learning/activity',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
