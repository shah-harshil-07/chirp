import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, InternalServerErrorException, UseInterceptors } from "@nestjs/common";

import { Comments } from "./comments.schema";
import { ICommentData } from "./comments.dto";
import { PostService } from "src/modules/posts/posts.service";
import { ResponseInterceptor } from "src/interceptors/response";

@Injectable()
export class CommentsService {
    constructor(
        private readonly postService: PostService,
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
    async list(postId: string): Promise<any> {
        const commentList = await this.commentModel.aggregate([
            { $match: { postId } },
            { $lookup: { from: "Users", localField: "userId", foreignField: "_id", as: "user" } },
        ]);

        return commentList;
    }
}
