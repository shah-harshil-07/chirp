import { IsJSON, IsOptional } from "class-validator";

export class CommentDTO {
    @IsJSON()
    data: string;

    @IsOptional()
    images: string[];
}

export interface ICommentData {
    text: string;
    createdAt: Date;
    postId: string;
    parentCommentId: string | null;
    userId: string;
    images: string[];
}