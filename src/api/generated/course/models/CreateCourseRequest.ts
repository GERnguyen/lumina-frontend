/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCourseRequest = {
    title: string;
    description: string;
    categoryId: string;
    price: number;
    discountedPrice?: number;
    isInSubscription: boolean;
    duration?: number;
    hasCertificate: boolean;
    certificateTitle?: string;
};

