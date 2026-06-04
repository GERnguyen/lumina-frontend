/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsByTimeResponse } from './StatisticsByTimeResponse';
export type CourseQnAStatisticsResponse = {
    questionsInRange?: number;
    answersInRange?: number;
    unansweredQuestionCount?: number;
    instructorAnswerRate?: number;
    questionsByTime?: Array<StatisticsByTimeResponse>;
};

