/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseListSubtitleTrackResponse } from '../models/ApiResponseListSubtitleTrackResponse';
import type { ApiResponsePresignedUrlResponse } from '../models/ApiResponsePresignedUrlResponse';
import type { ApiResponseSubtitleTrackResponse } from '../models/ApiResponseSubtitleTrackResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CreateSubtitleTrackRequest } from '../models/CreateSubtitleTrackRequest';
import type { UpdateSubtitleTrackRequest } from '../models/UpdateSubtitleTrackRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubtitleTrackControllerService {
    /**
     * @returns ApiResponseSubtitleTrackResponse OK
     * @throws ApiError
     */
    public static updateSubtitle({
        courseId,
        lessonId,
        subtitleId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        subtitleId: string,
        requestBody: UpdateSubtitleTrackRequest,
    }): CancelablePromise<ApiResponseSubtitleTrackResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/subtitles/{subtitleId}',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
                'subtitleId': subtitleId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteSubtitle({
        courseId,
        lessonId,
        subtitleId,
    }: {
        courseId: string,
        lessonId: string,
        subtitleId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/subtitles/{subtitleId}',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
                'subtitleId': subtitleId,
            },
        });
    }
    /**
     * @returns ApiResponseListSubtitleTrackResponse OK
     * @throws ApiError
     */
    public static getSubtitles({
        courseId,
        lessonId,
    }: {
        courseId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseListSubtitleTrackResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/subtitles',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
        });
    }
    /**
     * @returns ApiResponseSubtitleTrackResponse OK
     * @throws ApiError
     */
    public static createSubtitle({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: CreateSubtitleTrackRequest,
    }): CancelablePromise<ApiResponseSubtitleTrackResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/subtitles',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponsePresignedUrlResponse OK
     * @throws ApiError
     */
    public static getSubtitlePresignedUrl({
        courseId,
        lessonId,
        fileName,
        contentType,
        languageCode,
    }: {
        courseId: string,
        lessonId: string,
        fileName: string,
        contentType: string,
        languageCode: string,
    }): CancelablePromise<ApiResponsePresignedUrlResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{courseId}/lessons/{lessonId}/videos/subtitles/presigned-url',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            query: {
                'fileName': fileName,
                'contentType': contentType,
                'languageCode': languageCode,
            },
        });
    }
}
