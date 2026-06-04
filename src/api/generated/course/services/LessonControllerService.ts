/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseLessonResponse } from '../models/ApiResponseLessonResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CreateLessonRequest } from '../models/CreateLessonRequest';
import type { UpdateLessonRequest } from '../models/UpdateLessonRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LessonControllerService {
    /**
     * @returns ApiResponseLessonResponse OK
     * @throws ApiError
     */
    public static updateLesson({
        courseId,
        sectionId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        sectionId: string,
        lessonId: string,
        requestBody: UpdateLessonRequest,
    }): CancelablePromise<ApiResponseLessonResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{courseId}/sections/{sectionId}/lessons/{lessonId}',
            path: {
                'courseId': courseId,
                'sectionId': sectionId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteLesson({
        courseId,
        sectionId,
        lessonId,
    }: {
        courseId: string,
        sectionId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/courses/{courseId}/sections/{sectionId}/lessons/{lessonId}',
            path: {
                'courseId': courseId,
                'sectionId': sectionId,
                'lessonId': lessonId,
            },
        });
    }
    /**
     * @returns ApiResponseLessonResponse OK
     * @throws ApiError
     */
    public static createLesson({
        courseId,
        sectionId,
        requestBody,
    }: {
        courseId: string,
        sectionId: string,
        requestBody: CreateLessonRequest,
    }): CancelablePromise<ApiResponseLessonResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/sections/{sectionId}/lessons',
            path: {
                'courseId': courseId,
                'sectionId': sectionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
