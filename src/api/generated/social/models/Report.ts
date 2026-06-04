/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Report = {
    id?: string;
    version?: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
    reporterId?: string;
    refId?: string;
    type?: 'REVIEW' | 'QUESTION' | 'ANSWER';
    reason?: string;
};

