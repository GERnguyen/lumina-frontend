/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCourseCurriculumResponse } from '../models/ApiResponseCourseCurriculumResponse';
import type { ApiResponseCourseResponse } from '../models/ApiResponseCourseResponse';
import type { ApiResponseListCourseResponse } from '../models/ApiResponseListCourseResponse';
import type { ApiResponseRejectCourseResponse } from '../models/ApiResponseRejectCourseResponse';
import type { CreateCourseRequest } from '../models/CreateCourseRequest';
import type { PaginatedApiResponseCourseResponse } from '../models/PaginatedApiResponseCourseResponse';
import type { ReorderLessonsRequest } from '../models/ReorderLessonsRequest';
import type { UpdateCourseRequest } from '../models/UpdateCourseRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseControllerService {
    /**
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static getCourseById({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static updateCourse({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateCourseRequest,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reorder editable course curriculum
     * @returns ApiResponseCourseCurriculumResponse OK
     * @throws ApiError
     */
    public static reorderCurriculum({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: ReorderLessonsRequest,
    }): CancelablePromise<ApiResponseCourseCurriculumResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/courses/{id}/curriculum/reorder',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns PaginatedApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static getAllCourses({
        page = 1,
        size = 10,
        query,
        sort,
        rating,
        priceFrom,
        priceTo,
        categoryId,
        instructorId,
    }: {
        page?: number,
        size?: number,
        query?: string,
        sort?: string,
        rating?: number,
        priceFrom?: number,
        priceTo?: number,
        categoryId?: string,
        instructorId?: string,
    }): CancelablePromise<PaginatedApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses',
            query: {
                'page': page,
                'size': size,
                'query': query,
                'sort': sort,
                'rating': rating,
                'priceFrom': priceFrom,
                'priceTo': priceTo,
                'categoryId': categoryId,
                'instructorId': instructorId,
            },
        });
    }
    /**
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static createCourse({
        requestBody,
    }: {
        requestBody: CreateCourseRequest,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit course for approval
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static submitCourse({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/courses/{id}/submit',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ApiResponseRejectCourseResponse OK
     * @throws ApiError
     */
    public static getRejectReason({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseRejectCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{id}/reject-reason',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get editable course draft
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static getCourseDraft({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{id}/draft',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get editable course curriculum
     * @returns ApiResponseCourseCurriculumResponse OK
     * @throws ApiError
     */
    public static getDraftCurriculum({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseCourseCurriculumResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{id}/draft/curriculum',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ApiResponseCourseCurriculumResponse OK
     * @throws ApiError
     */
    public static getPublishedCurriculum({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseCourseCurriculumResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/{id}/curriculum',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get my courses
     * @returns PaginatedApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static getMyCourses({
        page = 1,
        size = 10,
        query,
        sort,
        rating,
        priceFrom,
        priceTo,
        status,
        categoryId,
    }: {
        page?: number,
        size?: number,
        query?: string,
        sort?: string,
        rating?: number,
        priceFrom?: number,
        priceTo?: number,
        status?: 'DRAFT' | 'WAITING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED',
        categoryId?: string,
    }): CancelablePromise<PaginatedApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/mine',
            query: {
                'page': page,
                'size': size,
                'query': query,
                'sort': sort,
                'rating': rating,
                'priceFrom': priceFrom,
                'priceTo': priceTo,
                'status': status,
                'categoryId': categoryId,
            },
        });
    }
    /**
     * @returns ApiResponseListCourseResponse OK
     * @throws ApiError
     */
    public static getCourseById1({
        ids,
    }: {
        ids: Array<string>,
    }): CancelablePromise<ApiResponseListCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/courses/ids',
            query: {
                'ids': ids,
            },
        });
    }
}
