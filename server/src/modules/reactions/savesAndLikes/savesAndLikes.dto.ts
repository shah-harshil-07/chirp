import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class SavesLikesDTO {
    @IsString()
    @IsNotEmpty()
    postId: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(["liked", "saved"])
    reaction: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(["post", "comment"])
    postType: string;
}

export interface SavesLikesData {
    userId: string;
    postId: string;
    reaction: string;
    postType: string;
}

export interface IPostInfo {
    postIds: string[];
}
