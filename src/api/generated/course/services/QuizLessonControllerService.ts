/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseObject } from '../models/ApiResponseObject';
import type { ApiResponseQuizLessonResponse } from '../models/ApiResponseQuizLessonResponse';
import type { CreateQuizLessonRequest } from '../models/CreateQuizLessonRequest';
import type { SyncQuizRequest } from '../models/SyncQuizRequest';
import type { UpdateQuizLessonRequest } from '../models/UpdateQuizLessonRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class QuizLessonControllerService {
    /**
     * @returns ApiResponseQuizLessonResponse OK
     * @throws ApiError
     */
    public static getQuizByLessonId({
        courseId,
        lessonId,
    }: {
        courseId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseQuizLessonResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
        });
    }
    /**
     * Update quiz (no questions)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static updateQuizSettings({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: UpdateQuizLessonRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Create quiz with initial questions
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static createQuizLesson({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: CreateQuizLessonRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Sync quiz changes to learning service (with optional regrade trigger)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static syncQuiz({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: SyncQuizRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes/sync',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
