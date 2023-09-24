import { IsNotEmpty, IsString, isArray } from "class-validator";

export class LikesDTO {
    @IsNotEmpty()
    @IsString()
    postId: string;
}

export interface LikesData {
    userId: string;
    postId: string;
}

export interface IPostInfo {
    postIds: string[];
}