import { IsJSON, IsOptional } from "class-validator";

export class PostDTO {
    @IsJSON()
    data: string;

    @IsOptional()
    images: string[];
}

interface IDuration {
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
