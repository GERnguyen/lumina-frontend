/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseSectionResponse } from '../models/ApiResponseSectionResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CreateSectionRequest } from '../models/CreateSectionRequest';
import type { UpdateSectionRequest } from '../models/UpdateSectionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SectionControllerService {
    /**
     * @returns ApiResponseSectionResponse OK
     * @throws ApiError
     */
    public static updateSection({
        courseId,
        sectionId,
        requestBody,
    }: {
        courseId: string,
        sectionId: string,
        requestBody: UpdateSectionRequest,
    }): CancelablePromise<ApiResponseSectionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{courseId}/sections/{sectionId}',
            path: {
                'courseId': courseId,
                'sectionId': sectionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteSection({
        courseId,
        sectionId,
    }: {
        courseId: string,
        sectionId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/courses/{courseId}/sections/{sectionId}',
            path: {
                'courseId': courseId,
                'sectionId': sectionId,
            },
        });
    }
    /**
     * @returns ApiResponseSectionResponse OK
     * @throws ApiError
     */
    public static createSection({
        courseId,
        requestBody,
    }: {
        courseId: string,
        requestBody: CreateSectionRequest,
    }): CancelablePromise<ApiResponseSectionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/sections',
            path: {
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
