/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseArticleLessonResponse } from '../models/ApiResponseArticleLessonResponse';
import type { ApiResponseObject } from '../models/ApiResponseObject';
import type { CreateArticleLessonRequest } from '../models/CreateArticleLessonRequest';
import type { UpdateArticleLessonRequest } from '../models/UpdateArticleLessonRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ArticleLessonControllerService {
    /**
     * @returns ApiResponseArticleLessonResponse OK
     * @throws ApiError
     */
    public static getArticleByLessonId({
        courseId,
        lessonId,
    }: {
        courseId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseArticleLessonResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/articles',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
        });
    }
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static updateArticleLesson({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: UpdateArticleLessonRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/articles',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static createArticleLesson({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: CreateArticleLessonRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/articles',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
