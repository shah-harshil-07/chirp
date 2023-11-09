import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, InternalServerErrorException, UseInterceptors } from "@nestjs/common";

import { Comments } from "./comments.schema";
import { ICommentData, ICommentList } from "./comments.dto";
import { PostService } from "src/modules/posts/posts.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { ConfigService } from "src/modules/config/config.service";

@Injectable()
export class CommentsService {
    constructor(
        private readonly postService: PostService,
        private readonly configService: ConfigService,
        @InjectModel(Comments.name) private readonly commentModel: Model<Comments>,
    ) { }

    @UseInterceptors(ResponseInterceptor)
    async create(commentData: ICommentData): Promise<Comments> {
        const { postId } = commentData;
        const createdComment = new this.commentModel(commentData);
        const isReactionAdded = await this.postService.changeReactionCount(postId, "commented", "add");

        if (!isReactionAdded) throw new InternalServerErrorException();
        else return createdComment.save();
    }

    @UseInterceptors(ResponseInterceptor)
    async list(postId: string): Promise<ICommentList> {
        const postData = await this.postService.getDetails(postId);

        const commentList = await this.commentModel.aggregate([
            { $match: { $expr: { $eq: ["$postId", { $toObjectId: postId }] } } },
            { $lookup: { from: "Users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
        ]);

        return { post: postData, comments: commentList };
    }

    @UseInterceptors(ResponseInterceptor)
    async changeReactionCount(commentId: string, reaction: string, mode: string): Promise<Comments> {
        const { attribute, count } = this.configService.getReactionConfig(reaction, mode);
        return await this.commentModel.findByIdAndUpdate(commentId, { $inc: { [attribute]: count } }, { new: true });
    }
}
