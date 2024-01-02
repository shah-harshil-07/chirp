import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, InternalServerErrorException, UseInterceptors } from "@nestjs/common";

import { Comments } from "./comments.schema";
import { PostService } from "src/modules/posts/posts.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { ConfigService } from "src/modules/config/config.service";
import { ICommentData, ICommentList, IUserComment } from "./comments.dto";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class CommentsService {
    constructor(
        private readonly postService: PostService,
        private readonly configService: ConfigService,
        @InjectModel(Comments.name) private readonly commentModel: Model<Comments>,
    ) { }

    async create(commentData: ICommentData): Promise<Comments> {
        const { postId } = commentData;
        const createdComment = new this.commentModel(commentData);
        const isReactionAdded = await this.postService.changeReactionCount(postId, "commented", "add");

        if (!isReactionAdded) throw new InternalServerErrorException();
        else return createdComment.save();
    }

    async list(postId: string): Promise<ICommentList> {
        const postData = await this.postService.getDetails(postId);

        await this.commentModel.updateMany({}, { $inc: { views: 1 } });

        const commentList = await this.commentModel.aggregate([
            { $match: { $expr: { $eq: ["$postId", { $toObjectId: postId }] } } },
            { $lookup: { from: "Users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
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
                    "user.name": 1,
                    "user.username": 1,
                    "user.picture": 1,
                },
            },
        ]);

        return { post: postData, comments: commentList };
    }

    async changeReactionCount(commentId: string, reaction: string, mode: string): Promise<Comments> {
        const { attribute, count } = this.configService.getReactionConfig(reaction, mode);
        return await this.commentModel.findByIdAndUpdate(commentId, { $inc: { [attribute]: count } }, { new: true });
    }

    async getUserComments(userId: string): Promise<IUserComment[]> {
        return await this.commentModel.aggregate([
            { $match: { $expr: { $eq: ["$userId", { $toObjectId: userId }] } } },
            { $lookup: { from: "PostMessages", localField: "postId", foreignField: "_id", as: "post" } },
            { $sort: { createdAt: -1 } },
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
                    "post.user.name": 1,
                    "post.user.picture": 1,
                    "post.user.username": 1,
                    "post.images": 1,
                    "post.poll": 1,
                    "post.createdAt": 1,
                    "post.comments": 1,
                    "post.reposts": 1,
                    "post.likes": 1,
                    "post.views": 1,
                    "post.saved": 1,
                    "post.comment._id": 1,
                    "post.comment.user._id": 1,
                    "post.comment.user.name": 1,
                    "post.comment.user.username": 1,
                    "post.comment.user.picture": 1,
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
                    "post.post.user.name": 1,
                    "post.post.user.picture": 1,
                    "post.post.user.username": 1,
                    "post.post.images": 1,
                    "post.post.poll": 1,
                    "post.post.createdAt": 1,
                },
            },
        ]);
    }
}
