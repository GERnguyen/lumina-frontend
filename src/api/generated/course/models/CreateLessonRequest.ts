/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateLessonRequest = {
    title: string;
    duration?: number;
    lessonType: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'ASSIGNMENT';
    isPreview: boolean;
    prerequisiteIds?: Array<string>;
};

