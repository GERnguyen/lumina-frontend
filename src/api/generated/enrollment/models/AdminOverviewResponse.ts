/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CourseStats } from './CourseStats';
import type { EnrollmentByTimeResponse } from './EnrollmentByTimeResponse';
import type { RevenueByTimeResponse } from './RevenueByTimeResponse';
export type AdminOverviewResponse = {
    totalGrossRevenue?: number;
    totalPlatformFeeRevenue?: number;
    totalOrders?: number;
    enrollmentsInRange?: number;
    paidOrdersInRange?: number;
    distinctLearnersInRange?: number;
    platformRevenueByTime?: Array<RevenueByTimeResponse>;
    enrollmentsByTime?: Array<EnrollmentByTimeResponse>;
    topCoursesByRevenue?: Array<CourseStats>;
    topCoursesByEnrollment?: Array<CourseStats>;
};

