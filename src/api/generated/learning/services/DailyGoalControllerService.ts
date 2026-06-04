/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponseDailyGoalResponse } from '../models/ApiResponseDailyGoalResponse';
import type { ApiResponseListDailyGoalResponse } from '../models/ApiResponseListDailyGoalResponse';
import type { ApiResponseVoid } from '../models/ApiResponseVoid';
import type { SetDailyGoalRequest } from '../models/SetDailyGoalRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DailyGoalControllerService {
    /**
     * Get current user's daily goals for a specific date
     * @returns ApiResponseListDailyGoalResponse OK
     * @throws ApiError
     */
    public static getDailyGoals({
        date,
    }: {
        date?: string,
    }): CancelablePromise<ApiResponseListDailyGoalResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/daily-goals',
            query: {
                'date': date,
            },
        });
    }
    /**
     * Edit current user's daily goal target
     * @returns ApiResponseDailyGoalResponse OK
     * @throws ApiError
     */
    public static editDailyGoal({
        requestBody,
    }: {
        requestBody: SetDailyGoalRequest,
    }): CancelablePromise<ApiResponseDailyGoalResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/daily-goals',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Set current user's daily goal target
     * @returns ApiResponseDailyGoalResponse OK
     * @throws ApiError
     */
    public static setDailyGoal({
        requestBody,
    }: {
        requestBody: SetDailyGoalRequest,
    }): CancelablePromise<ApiResponseDailyGoalResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/daily-goals',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete current user's daily goal for a specific date
     * @returns ApiResponseVoid OK
     * @throws ApiError
     */
    public static deleteDailyGoal({
        goalType,
        date,
        targetItemId,
    }: {
        goalType: 'XP' | 'LEARNING_ITEMS_COMPLETED' | 'VIDEOS_COMPLETED' | 'QUIZZES_PASSED' | 'ASSIGNMENTS_SUBMITTED' | 'SPECIFIC_LESSON_COMPLETED',
        date?: string,
        targetItemId?: string,
    }): CancelablePromise<ApiResponseVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/daily-goals',
            query: {
                'date': date,
                'goalType': goalType,
                'targetItemId': targetItemId,
            },
        });
    }
    /**
     * Get current user's daily goals for a specific month
     * @returns ApiResponseListDailyGoalResponse OK
     * @throws ApiError
     */
    public static getDailyGoalsInMonth({
        year,
        month,
    }: {
        year: number,
        month: number,
    }): CancelablePromise<ApiResponseListDailyGoalResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/daily-goals/month',
            query: {
                'year': year,
                'month': month,
            },
        });
    }
}
