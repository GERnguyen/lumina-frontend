/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseListInVideoAssessmentSubmissionResponse } from '../models/ApiResponseListInVideoAssessmentSubmissionResponse';
import type { ApiResponseObject } from '../models/ApiResponseObject';
import type { ApiResponseVideoLessonTrackingHistoryResponse } from '../models/ApiResponseVideoLessonTrackingHistoryResponse';
import type { PaginatedApiResponseVideoLessonTrackingHistoryResponse } from '../models/PaginatedApiResponseVideoLessonTrackingHistoryResponse';
import type { SubmitVideoQuestionRequest } from '../models/SubmitVideoQuestionRequest';
import type { TrackingVideoLessonRequest } from '../models/TrackingVideoLessonRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VideoTrackingControllerService {
    /**
     * @returns PaginatedApiResponseVideoLessonTrackingHistoryResponse OK
     * @throws ApiError
     */
    public static getVideoLessonTrackingHistories({
        courseId,
        lessonId,
        page = 1,
        size = 10,
        query,
        sort,
    }: {
        courseId: string,
        lessonId: string,
        page?: number,
        size?: number,
        query?: string,
        sort?: string,
    }): CancelablePromise<PaginatedApiResponseVideoLessonTrackingHistoryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/courses/{courseId}/lessons/{lessonId}/video-tracking',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            query: {
                'page': page,
                'size': size,
                'query': query,
                'sort': sort,
            },
        });
    }
    /**
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static trackVideoProgress({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: TrackingVideoLessonRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/learning/courses/{courseId}/lessons/{lessonId}/video-tracking',
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
    public static submitVideoQuestionAnswer({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: SubmitVideoQuestionRequest,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/learning/courses/{courseId}/lessons/{lessonId}/video-tracking/questions/submit',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseListInVideoAssessmentSubmissionResponse OK
     * @throws ApiError
     */
    public static getVideoQuestionSubmissions({
        courseId,
        lessonId,
    }: {
        courseId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseListInVideoAssessmentSubmissionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/courses/{courseId}/lessons/{lessonId}/video-tracking/submissions',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
        });
    }
    /**
     * @returns ApiResponseVideoLessonTrackingHistoryResponse OK
     * @throws ApiError
     */
    public static getVideoLessonTrackingHistory({
        courseId,
        lessonId,
    }: {
        courseId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseVideoLessonTrackingHistoryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/courses/{courseId}/lessons/{lessonId}/video-tracking/history',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
        });
    }
}
