/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseListVideoQuestionResponse } from '../models/ApiResponseListVideoQuestionResponse';
import type { ApiResponseVideoQuestionResponse } from '../models/ApiResponseVideoQuestionResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CreateVideoQuestionRequest } from '../models/CreateVideoQuestionRequest';
import type { UpdateVideoQuestionRequest } from '../models/UpdateVideoQuestionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VideoQuestionControllerService {
    /**
     * @returns ApiResponseVideoQuestionResponse OK
     * @throws ApiError
     */
    public static getQuestionById({
        courseId,
        lessonId,
        id,
    }: {
        courseId: string,
        lessonId: string,
        id: string,
    }): CancelablePromise<ApiResponseVideoQuestionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/questions/{id}',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
                'id': id,
            },
        });
    }
    /**
     * @returns ApiResponseVideoQuestionResponse OK
     * @throws ApiError
     */
    public static updateQuestion({
        courseId,
        lessonId,
        id,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        id: string,
        requestBody: UpdateVideoQuestionRequest,
    }): CancelablePromise<ApiResponseVideoQuestionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/questions/{id}',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteQuestion({
        courseId,
        lessonId,
        id,
    }: {
        courseId: string,
        lessonId: string,
        id: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/questions/{id}',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
                'id': id,
            },
        });
    }
    /**
     * @returns ApiResponseListVideoQuestionResponse OK
     * @throws ApiError
     */
    public static getQuestionsByLessonId({
        courseId,
        lessonId,
    }: {
        courseId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseListVideoQuestionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/questions',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
        });
    }
    /**
     * @returns ApiResponseVideoQuestionResponse OK
     * @throws ApiError
     */
    public static createQuestion({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: CreateVideoQuestionRequest,
    }): CancelablePromise<ApiResponseVideoQuestionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/questions',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
