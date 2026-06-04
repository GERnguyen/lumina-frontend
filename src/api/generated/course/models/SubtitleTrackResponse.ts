/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubtitleTrackResponse = {
    id?: string;
    languageCode?: string;
    displayName?: string;
    fileUrl?: string;
    fileKey?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    format?: 'VTT' | 'SRT';
    source?: 'MANUAL' | 'AI_GENERATED' | 'AI_EDITED';
    status?: 'READY' | 'PROCESSING' | 'FAILED';
    isDefault?: boolean;
};

