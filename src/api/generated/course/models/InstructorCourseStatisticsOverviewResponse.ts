/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsByTimeResponse } from './StatisticsByTimeResponse';
export type InstructorCourseStatisticsOverviewResponse = {
    createdCoursesInRange?: number;
    createdCoursesByTime?: Array<StatisticsByTimeResponse>;
    currentCourseCount?: number;
    currentPublishedCourseCount?: number;
    averageRating?: number;
    currentEnrollmentSnapshot?: number;
};

