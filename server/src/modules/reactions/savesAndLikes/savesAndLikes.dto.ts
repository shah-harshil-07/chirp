import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class SavesLikesDTO {
    @IsString()
    @IsNotEmpty()
    postId: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(["liked", "saved"])
    reaction: string;
}

export interface SavesLikesData {
    userId: string;
    postId: string;
    reaction: string;
}

export interface IPostInfo {
    postIds: string[];
}