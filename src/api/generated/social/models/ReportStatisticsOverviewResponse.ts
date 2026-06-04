/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsByTimeResponse } from './StatisticsByTimeResponse';
import type { TopReportedRefResponse } from './TopReportedRefResponse';
export type ReportStatisticsOverviewResponse = {
    reportsInRange?: number;
    reportsByType?: Record<string, number>;
    reportsByTime?: Array<StatisticsByTimeResponse>;
    topReportedRefs?: Array<TopReportedRefResponse>;
};

