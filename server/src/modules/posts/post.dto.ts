import { Optional } from "@nestjs/common";
import { IsJSON } from "class-validator";

export class PostDTO {
    @IsJSON()
    data: string;

    @Optional()
    images: string[]
}

interface IDuration {
    days: number;
    hours: number;
    minutes: number;
}

interface IPoll {
    choices: string[];
    duration: IDuration;
}

export interface ParsedPostDTO {
    text: string;
    images: string[];
    poll: IPoll;
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
    postTiming: number;
    schedule: ISchedule;
}

export interface IScheduledPostIds {
    postIds: string[];
}
