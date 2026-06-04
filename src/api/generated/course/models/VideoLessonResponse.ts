/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubtitleTrackResponse } from './SubtitleTrackResponse';
export type VideoLessonResponse = {
    videoUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    duration?: number;
    status?: string;
    hasQuestions?: boolean;
    questionCount?: number;
    hasSubtitles?: boolean;
    subtitleCount?: number;
    subtitles?: Array<SubtitleTrackResponse>;
};

