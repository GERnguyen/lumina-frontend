/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseListQuizQuestionResponse } from '../models/ApiResponseListQuizQuestionResponse';
import type { ApiResponseObject } from '../models/ApiResponseObject';
import type { ApiResponseQuizQuestionResponse } from '../models/ApiResponseQuizQuestionResponse';
import type { CreateQuizQuestionRequest } from '../models/CreateQuizQuestionRequest';
import type { UpdateQuizQuestionRequest } from '../models/UpdateQuizQuestionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class QuizQuestionControllerService {
    /**
     * Update a question (options use merge strategy: id→update, no id→create, missing→delete)
     * @returns ApiResponseQuizQuestionResponse OK
     * @throws ApiError
     */
    public static updateQuestion1({
        lessonId,
        questionId,
        courseId,
        requestBody,
    }: {
        lessonId: string,
        questionId: string,
        courseId: string,
        requestBody: UpdateQuizQuestionRequest,
    }): CancelablePromise<ApiResponseQuizQuestionResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes/questions/{questionId}',
            path: {
                'lessonId': lessonId,
                'questionId': questionId,
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a question (blocked if it would violate numberOfQuestionPerQuizSession)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static deleteQuestion1({
        lessonId,
        questionId,
        courseId,
    }: {
        lessonId: string,
        questionId: string,
        courseId: string,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes/questions/{questionId}',
            path: {
                'lessonId': lessonId,
                'questionId': questionId,
                'courseId': courseId,
            },
        });
    }
    /**
     * List all questions for a quiz
     * @returns ApiResponseListQuizQuestionResponse OK
     * @throws ApiError
     */
    public static getQuestions({
        lessonId,
        courseId,
    }: {
        lessonId: string,
        courseId: string,
    }): CancelablePromise<ApiResponseListQuizQuestionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes/questions',
            path: {
                'lessonId': lessonId,
                'courseId': courseId,
            },
        });
    }
    /**
     * Add a question to a quiz
     * @returns ApiResponseQuizQuestionResponse OK
     * @throws ApiError
     */
    public static addQuestion({
        lessonId,
        courseId,
        requestBody,
    }: {
        lessonId: string,
        courseId: string,
        requestBody: CreateQuizQuestionRequest,
    }): CancelablePromise<ApiResponseQuizQuestionResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/quizzes/questions',
            path: {
                'lessonId': lessonId,
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
