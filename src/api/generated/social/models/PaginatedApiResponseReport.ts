/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedMetadata } from './PaginatedMetadata';
import type { Report } from './Report';
export type PaginatedApiResponseReport = {
    success?: boolean;
    message?: string;
    data?: Array<Report>;
    meta?: PaginatedMetadata;
};

