/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseCourseResponse } from '../models/ApiResponseCourseResponse';
import type { ApiResponseListCourseChangeResponse } from '../models/ApiResponseListCourseChangeResponse';
import type { PaginatedApiResponseCourseResponse } from '../models/PaginatedApiResponseCourseResponse';
import type { RejectCourseRequest } from '../models/RejectCourseRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AdminCourseControllerService {
    /**
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static rejectCourse({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: RejectCourseRequest,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/courses/{id}/reject',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static approveCourse({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/courses/{id}/approve',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns PaginatedApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static getAllCourses1({
        page = 1,
        size = 10,
        query,
        sort,
        rating,
        priceFrom,
        priceTo,
        status,
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
        status?: 'DRAFT' | 'WAITING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED',
        categoryId?: string,
        instructorId?: string,
    }): CancelablePromise<PaginatedApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/courses',
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
                'instructorId': instructorId,
            },
        });
    }
    /**
     * @returns ApiResponseCourseResponse OK
     * @throws ApiError
     */
    public static getCourseById2({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseCourseResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/courses/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns ApiResponseListCourseChangeResponse OK
     * @throws ApiError
     */
    public static getCourseChanges({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseListCourseChangeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/courses/{id}/changes',
            path: {
                'id': id,
            },
        });
    }
}
