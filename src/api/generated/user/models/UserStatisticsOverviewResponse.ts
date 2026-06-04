/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsByTimeResponse } from './StatisticsByTimeResponse';
export type UserStatisticsOverviewResponse = {
    newUsersInRange?: number;
    usersByRole?: Record<string, number>;
    instructorsByVerificationStatus?: Record<string, number>;
    newUsersByTime?: Array<StatisticsByTimeResponse>;
    currentTotalUsers?: number;
};

