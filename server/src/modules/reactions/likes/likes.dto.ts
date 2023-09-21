import { IsNotEmpty, IsString } from "class-validator";

export class LikesDTO {
    @IsNotEmpty()
    @IsString()
    postId: string;
}

export interface LikesData {
    userId: string;
    postId: string;
}