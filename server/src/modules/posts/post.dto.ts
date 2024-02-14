import { IsJSON, IsNumberString, IsOptional } from "class-validator";

import { Post } from "./post.schema";

export class PostDTO {
    @IsJSON()
    data: string;

    @IsOptional()
    images: string[];
}

export class TopupParamProps {
    @IsNumberString()
    topupCount: number;
}

export interface IDuration {
    days: number;
    hours: number;
    minutes: number;
}

export interface IPoll {
    choices: string[];
    duration: IDuration;
}

export interface ParsedPostDTO {
    text: string;
    images: string[];
    poll: IPoll;
    postId?: string;
}

interface ISchedule {
    year: number;
    month: number;
    dayOfMonth: number;
    hours: number;
    minutes: number;
}

export interface ScheduledPostDTO {
    data: ParsedPostDTO;
    timeoutId: string;
    schedule: ISchedule;
}

export interface IScheduledPostIds {
    postIds: string[];
}

export interface IVotingUserData {
    postId: string;
    choiceIndex: number;
    prevChoiceIndex?: number;
}

export class IRepostedCommentPost extends Post {
    type: string;
    parentPost: any;
}

export const validationParamList = {
    index: {
        topupParamProps: {
            topupCount: "required|isInteger|isNonNegative",
        }
    },
}
