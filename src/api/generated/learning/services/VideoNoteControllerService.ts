/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseListVideoNoteDto } from '../models/ApiResponseListVideoNoteDto';
import type { ApiResponseVideoNoteDto } from '../models/ApiResponseVideoNoteDto';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { CreateVideoNoteRequest } from '../models/CreateVideoNoteRequest';
import type { UpdateVideoNoteRequest } from '../models/UpdateVideoNoteRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VideoNoteControllerService {
    /**
     * @returns ApiResponseVideoNoteDto OK
     * @throws ApiError
     */
    public static updateNote({
        noteId,
        requestBody,
    }: {
        noteId: string,
        requestBody: UpdateVideoNoteRequest,
    }): CancelablePromise<ApiResponseVideoNoteDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/learning/video-notes/{noteId}',
            path: {
                'noteId': noteId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteNote({
        noteId,
    }: {
        noteId: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/learning/video-notes/{noteId}',
            path: {
                'noteId': noteId,
            },
        });
    }
    /**
     * @returns ApiResponseListVideoNoteDto OK
     * @throws ApiError
     */
    public static getNotesByLesson({
        courseId,
        lessonId,
    }: {
        courseId: string,
        lessonId: string,
    }): CancelablePromise<ApiResponseListVideoNoteDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/courses/{courseId}/lessons/{lessonId}/video-notes',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
        });
    }
    /**
     * @returns ApiResponseVideoNoteDto OK
     * @throws ApiError
     */
    public static createNote({
        courseId,
        lessonId,
        requestBody,
    }: {
        courseId: string,
        lessonId: string,
        requestBody: CreateVideoNoteRequest,
    }): CancelablePromise<ApiResponseVideoNoteDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/learning/courses/{courseId}/lessons/{lessonId}/video-notes',
            path: {
                'courseId': courseId,
                'lessonId': lessonId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseListVideoNoteDto OK
     * @throws ApiError
     */
    public static getNotesByCourse({
        courseId,
    }: {
        courseId: string,
    }): CancelablePromise<ApiResponseListVideoNoteDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/learning/courses/{courseId}/video-notes',
            path: {
                'courseId': courseId,
            },
        });
    }
}
