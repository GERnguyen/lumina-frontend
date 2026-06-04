/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LearningActivityByTimeResponse } from './LearningActivityByTimeResponse';
export type CourseEngagementOverviewResponse = {
    activeLearnersInRange?: number;
    totalLearningSeconds?: number;
    averageProgressPercent?: number;
    completionRate?: number;
    activityByTime?: Array<LearningActivityByTimeResponse>;
};

