/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsByTimeResponse } from './StatisticsByTimeResponse';
export type AdminCourseStatisticsOverviewResponse = {
    createdCoursesInRange?: number;
    createdCoursesByStatus?: Record<string, number>;
    createdCoursesByTime?: Array<StatisticsByTimeResponse>;
    currentCoursesByStatus?: Record<string, number>;
    currentPublishedCount?: number;
};

