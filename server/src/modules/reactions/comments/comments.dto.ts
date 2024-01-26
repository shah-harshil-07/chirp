import { IsIn, IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { Post } from "src/modules/posts/post.schema";
import { Comments } from "./comments.schema";

export class CommentDTO {
    @IsJSON()
    data: string;

    @IsOptional()
    images: string[];
}

export class ICommentListReqDTO {
    @IsString()
    @IsNotEmpty()
    @IsIn(["post", "comment"])
    type: string;
}

export interface IPostId {
    postId: string;
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
    post: Post | Comments,
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

export interface IUserComment {
    post: Post;
    comments: {
        text: string;
        createdAt: Date;
        images: string[];
        comments: number;
        likes: number;
        saved: number;
        views: number;
    }
}