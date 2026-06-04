/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseObject } from '../models/ApiResponseObject';
import type { ApiResponseUserDto } from '../models/ApiResponseUserDto';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { DeviceTokenRequest } from '../models/DeviceTokenRequest';
import type { PaginatedApiResponseUserDto } from '../models/PaginatedApiResponseUserDto';
import type { UpdateProfileRequest } from '../models/UpdateProfileRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * Get user by ID
     * @returns ApiResponseUserDto OK
     * @throws ApiError
     */
    public static getUserById({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update user profile
     * @returns ApiResponseUserDto OK
     * @throws ApiError
     */
    public static updateUser({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateProfileRequest,
    }): CancelablePromise<ApiResponseUserDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Approve instructor (admin)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static verifyInstructor({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/{id}/verify-instructor',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Reject instructor (admin)
     * @returns ApiResponseObject OK
     * @throws ApiError
     */
    public static rejectInstructor({
        id,
        reason,
    }: {
        id: string,
        reason: string,
    }): CancelablePromise<ApiResponseObject> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/{id}/reject-instructor',
            path: {
                'id': id,
            },
            query: {
                'reason': reason,
            },
        });
    }
    /**
     * Save FCM device token
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static saveDeviceToken({
        requestBody,
    }: {
        requestBody: DeviceTokenRequest,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/device-tokens',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * List all users (admin)
     * @returns PaginatedApiResponseUserDto OK
     * @throws ApiError
     */
    public static getAllUsers({
        page = 1,
        size = 10,
        query,
        sort,
        role,
        isInstructorVerified,
    }: {
        page?: number,
        size?: number,
        query?: string,
        sort?: string,
        role?: 'USER' | 'INSTRUCTOR' | 'ADMIN',
        isInstructorVerified?: boolean,
    }): CancelablePromise<PaginatedApiResponseUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users',
            query: {
                'page': page,
                'size': size,
                'query': query,
                'sort': sort,
                'role': role,
                'isInstructorVerified': isInstructorVerified,
            },
        });
    }
    /**
     * Get current user profile
     * @returns ApiResponseUserDto OK
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<ApiResponseUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me',
        });
    }
}
