import { IsJSON, IsOptional } from "class-validator";

import { Post } from "src/modules/posts/post.schema";

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

export const validationParamList = {
    store: {
        commentData: {
            text: "required|isString",
            postId: "required|isString",
        },
    },
}

export interface ICommentList {
    post: Post,
    comments: Array<CommentDataDTO>,
}

interface CommentDataDTO {
    text: string;
    createdAt: string;
    userId: string;
    images: string[];
    user: CommentUserData;
}

interface CommentUserData {
    name: string;
    username: string;
    email: string;
    googleId: string;
    picture: string;
}