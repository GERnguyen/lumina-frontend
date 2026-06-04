/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BanUserRequest = {
    reasonType: 'SPAM' | 'NEGATIVE_WORDS' | 'INSULT' | 'POLICY_ABUSE';
    details: string;
    durationDays?: number;
};

