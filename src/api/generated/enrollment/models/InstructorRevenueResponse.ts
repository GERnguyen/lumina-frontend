/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseRevenueResponse } from './CourseRevenueResponse';
import type { RevenueByTimeResponse } from './RevenueByTimeResponse';
export type InstructorRevenueResponse = {
    totalRevenue?: number;
    revenueByMonth?: Array<RevenueByTimeResponse>;
    courseRevenues?: Array<CourseRevenueResponse>;
};

