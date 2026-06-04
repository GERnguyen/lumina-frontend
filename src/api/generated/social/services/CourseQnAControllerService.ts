/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseAnswerDto } from '../models/ApiResponseAnswerDto';
import type { ApiResponseQuestionDto } from '../models/ApiResponseQuestionDto';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CreateAnswerRequest } from '../models/CreateAnswerRequest';
import type { CreateQnAReportRequest } from '../models/CreateQnAReportRequest';
import type { CreateQuestionRequest } from '../models/CreateQuestionRequest';
import type { PaginatedApiResponseAnswerDto } from '../models/PaginatedApiResponseAnswerDto';
import type { PaginatedApiResponseQuestionDto } from '../models/PaginatedApiResponseQuestionDto';
import type { UpdateAnswerRequest } from '../models/UpdateAnswerRequest';
import type { UpdateQuestionRequest } from '../models/UpdateQuestionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseQnAControllerService {
    /**
     * @returns ApiResponseQuestionDto OK
     * @throws ApiError
     */
    public static getQuestionById({
        questionId,
    }: {
        questionId: string,
    }): CancelablePromise<ApiResponseQuestionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/course-qna/questions/{questionId}',
            path: {
                'questionId': questionId,
            },
        });
    }
    /**
     * @returns ApiResponseQuestionDto OK
     * @throws ApiError
     */
    public static updateQuestion({
        questionId,
        requestBody,
    }: {
        questionId: string,
        requestBody: UpdateQuestionRequest,
    }): CancelablePromise<ApiResponseQuestionDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/course-qna/questions/{questionId}',
            path: {
                'questionId': questionId,
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
        questionId,
    }: {
        questionId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/course-qna/questions/{questionId}',
            path: {
                'questionId': questionId,
            },
        });
    }
    /**
     * @returns ApiResponseAnswerDto OK
     * @throws ApiError
     */
    public static updateAnswer({
        answerId,
        requestBody,
    }: {
        answerId: string,
        requestBody: UpdateAnswerRequest,
    }): CancelablePromise<ApiResponseAnswerDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/course-qna/answers/{answerId}',
            path: {
                'answerId': answerId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteAnswer({
        answerId,
    }: {
        answerId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/course-qna/answers/{answerId}',
            path: {
                'answerId': answerId,
            },
        });
    }
    /**
     * @returns PaginatedApiResponseQuestionDto OK
     * @throws ApiError
     */
    public static getQuestions({
        courseId,
        lessonId,
        page = 1,
        size = 10,
        sort,
    }: {
        courseId: string,
        lessonId?: string,
        page?: number,
        size?: number,
        sort?: string,
    }): CancelablePromise<PaginatedApiResponseQuestionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/course-qna/questions',
            query: {
                'courseId': courseId,
                'lessonId': lessonId,
                'page': page,
                'size': size,
                'sort': sort,
            },
        });
    }
    /**
     * @returns ApiResponseQuestionDto OK
     * @throws ApiError
     */
    public static createQuestion({
        requestBody,
    }: {
        requestBody: CreateQuestionRequest,
    }): CancelablePromise<ApiResponseQuestionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/course-qna/questions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static upvoteQuestion({
        questionId,
    }: {
        questionId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/course-qna/questions/{questionId}/upvote',
            path: {
                'questionId': questionId,
            },
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static reportQuestion({
        questionId,
        requestBody,
    }: {
        questionId: string,
        requestBody: CreateQnAReportRequest,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/course-qna/questions/{questionId}/report',
            path: {
                'questionId': questionId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseAnswerDto OK
     * @throws ApiError
     */
    public static createAnswer({
        requestBody,
    }: {
        requestBody: CreateAnswerRequest,
    }): CancelablePromise<ApiResponseAnswerDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/course-qna/answers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static upvoteAnswer({
        answerId,
    }: {
        answerId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/course-qna/answers/{answerId}/upvote',
            path: {
                'answerId': answerId,
            },
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static reportAnswer({
        answerId,
        requestBody,
    }: {
        answerId: string,
        requestBody: CreateQnAReportRequest,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/course-qna/answers/{answerId}/report',
            path: {
                'answerId': answerId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns PaginatedApiResponseAnswerDto OK
     * @throws ApiError
     */
    public static getAnswersForQuestion({
        questionId,
        page = 1,
        size = 10,
        sort,
    }: {
        questionId: string,
        page?: number,
        size?: number,
        sort?: string,
    }): CancelablePromise<PaginatedApiResponseAnswerDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/course-qna/questions/{questionId}/answers',
            path: {
                'questionId': questionId,
            },
            query: {
                'page': page,
                'size': size,
                'sort': sort,
            },
        });
    }
    /**
     * @returns PaginatedApiResponseAnswerDto OK
     * @throws ApiError
     */
    public static getReplies({
        answerId,
        page = 1,
        size = 10,
        sort,
    }: {
        answerId: string,
        page?: number,
        size?: number,
        sort?: string,
    }): CancelablePromise<PaginatedApiResponseAnswerDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/course-qna/answers/{answerId}/replies',
            path: {
                'answerId': answerId,
            },
            query: {
                'page': page,
                'size': size,
                'sort': sort,
            },
        });
    }
}
