/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SetDailyGoalRequest = {
    goalType: 'XP' | 'LEARNING_ITEMS_COMPLETED' | 'VIDEOS_COMPLETED' | 'QUIZZES_PASSED' | 'ASSIGNMENTS_SUBMITTED' | 'SPECIFIC_LESSON_COMPLETED';
    targetValue?: number;
    goalDate?: string;
    targetItemId?: string;
};

