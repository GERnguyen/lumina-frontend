/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseProgressSummaryResponse } from './CourseProgressSummaryResponse';
export type CoursesProgressSummaryResponse = {
    totalStudentProgressCount?: number;
    completedStudentProgressCount?: number;
    completionRate?: number;
    courses?: Array<CourseProgressSummaryResponse>;
};

