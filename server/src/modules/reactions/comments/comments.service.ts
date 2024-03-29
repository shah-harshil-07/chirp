import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Inject, Injectable, InternalServerErrorException, UseInterceptors, forwardRef } from "@nestjs/common";

import { Comments } from "./comments.schema";
import { Post } from "src/modules/posts/post.schema";
import { PostService } from "src/modules/posts/posts.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { ConfigService } from "src/modules/config/config.service";
import { CommonService } from "src/modules/common/common.service";
import { ICommentData, ICommentList, IUserComment } from "./comments.dto";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class CommentsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly commonService: CommonService,
        @InjectModel(Comments.name) private readonly commentModel: Model<Comments>,
        @Inject(forwardRef(() => PostService)) private readonly postService: PostService,
    ) { }

    async create(commentData: ICommentData): Promise<Comments> {
        const { postId } = commentData;
        const createdComment = new this.commentModel(commentData);
        let isReactionAdded: Post | Comments;
        const { parentCommentId } = commentData;

        if (parentCommentId) isReactionAdded = await this.changeReactionCount(parentCommentId, "commented", "add");
        else isReactionAdded = await this.postService.changeReactionCount(postId, "commented", "add");

        if (!isReactionAdded) throw new InternalServerErrorException();
        else return createdComment.save();
    }

    async getCommentDetails(commentId: string): Promise<Comments> {
        return await this
            .commentModel
            .findById(commentId)
            .populate("userId", "_id name username picture bio followers following");
    }

    async list(postId: string, type: string): Promise<ICommentList> {
        let matchQuery: any;
        let baseData: Post | Comments;

        if (type === "post") {
            baseData = await this.postService.getDetails(postId);
            matchQuery = { $expr: { $eq: ["$postId", { $toObjectId: postId }] }, parentCommentId: null };
        } else {
            const commentData = await this.getCommentDetails(postId);
            const clonedCommentData = JSON.parse(JSON.stringify(commentData));
            clonedCommentData.user = clonedCommentData.userId;
            delete clonedCommentData.userId;
            baseData = clonedCommentData;
            matchQuery = { parentCommentId: postId };
        }

        await this.commentModel.updateMany({}, { $inc: { views: 1 } });

        const commentList = await this.commentModel.aggregate([
            { $match: { ...matchQuery } },
            { $lookup: { from: "Users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    "text": 1,
                    "createdAt": 1,
                    "postId": 1,
                    "images": 1,
                    "comments": 1,
                    "likes": 1,
                    "saved": 1,
                    "views": 1,
                    "reposts": 1,
                    "user._id": 1,
                    "parentCommentId": 1,
                    "user.bio": 1,
                    "user.name": 1,
                    "user.picture": 1,
                    "user.username": 1,
                    "user.followers": 1,
                    "user.following": 1,
                },
            },
        ]);

        return { post: baseData, comments: commentList };
    }

    async changeReactionCount(commentId: string, reaction: string, mode: string): Promise<Comments> {
        const { attribute, count } = this.configService.getReactionConfig(reaction, mode);
        return await this.commentModel.findByIdAndUpdate(commentId, { $inc: { [attribute]: count } }, { new: true });
    }

    async getUserComments(userId: string, topupCount: number): Promise<IUserComment[]> {
        const [ startCount, endCount ] = this.commonService.getTopupRange(topupCount);

        const comments = await this.commentModel.aggregate([
            { $match: { $expr: { $eq: ["$userId", { $toObjectId: userId }] } } },
            { $lookup: { from: "PostMessages", localField: "postId", foreignField: "_id", as: "post" } },
            { $sort: { createdAt: -1 } },
            { $skip: startCount },
            { $limit: endCount },
            { $group: { _id: "$postId", commentId: { $first: "$_id" } } },
            { $lookup: { from: "PostMessages", localField: "_id", foreignField: "_id", as: "post" } },
            { $unwind: "$post" },
            { $lookup: { from: "Comments", localField: "commentId", foreignField: "_id", as: "post.comment" } },
            { $unwind: "$post.comment" },
            { $lookup: { from: "Users", localField: "post.comment.userId", foreignField: "_id", as: "post.comment.user" } },
            { $unwind: "$post.comment.user" },
            { $lookup: { from: "Users", localField: "post.user", foreignField: "_id", as: "post.user" } },
            { $unwind: "$post.user" },
            { $lookup: { from: "PostMessages", localField: "post.postId", foreignField: "_id", as: "post.post" } },
            { $unwind: { path: "$post.post", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "Users", localField: "post.post.user", foreignField: "_id", as: "post.post.user" } },
            { $unwind: { path: "$post.post.user", preserveNullAndEmptyArrays: true } },
            { $sort: { "post.createdAt": -1 } },
            {
                $project: {
                    "_id": 0,
                    "post._id": 1,
                    "post.text": 1,
                    "post.user._id": 1,
                    "post.user.bio": 1,
                    "post.user.name": 1,
                    "post.user.picture": 1,
                    "post.user.username": 1,
                    "post.user.followers": 1,
                    "post.user.following": 1,
                    "post.images": 1,
                    "post.poll": 1,
                    "post.createdAt": 1,
                    "post.comments": 1,
                    "post.reposts": 1,
                    "post.likes": 1,
                    "post.views": 1,
                    "post.saved": 1,
                    "post.postId": 1,
                    "post.comment._id": 1,
                    "post.comment.user._id": 1,
                    "post.comment.user.bio": 1,
                    "post.comment.user.name": 1,
                    "post.comment.user.picture": 1,
                    "post.comment.user.username": 1,
                    "post.comment.user.followers": 1,
                    "post.comment.user.following": 1,
                    "post.comment.text": 1,
                    "post.comment.createdAt": 1,
                    "post.comment.images": 1,
                    "post.comment.comments": 1,
                    "post.comment.likes": 1,
                    "post.comment.saved": 1,
                    "post.comment.views": 1,
                    "post.post._id": 1,
                    "post.post.text": 1,
                    "post.post.user._id": 1,
                    "post.post.user.bio": 1,
                    "post.post.user.name": 1,
                    "post.post.user.picture": 1,
                    "post.post.user.username": 1,
                    "post.post.user.followers": 1,
                    "post.post.user.following": 1,
                    "post.post.images": 1,
                    "post.post.poll": 1,
                    "post.post.createdAt": 1,
                },
            },
        ]);

        const clonedComments = JSON.parse(JSON.stringify(comments));

        for (const comment of clonedComments) {
            if (comment?.post?.postId && !comment?.post?.post._id) {
                const commentData = await this.getCommentDetails(comment.post.postId);
                const clonedCommentData = JSON.parse(JSON.stringify(commentData));
                clonedCommentData.user = clonedCommentData?.userId ?? null;
                if (clonedCommentData?.userId) delete clonedCommentData.userId;
                comment.post.post = clonedCommentData;
            }
        }

        return clonedComments;
    }
}
