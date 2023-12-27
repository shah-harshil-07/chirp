import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, InternalServerErrorException, UseInterceptors } from "@nestjs/common";

import { SavesAndLikes } from "./savesAndLikes.schema";
import { PostService } from "src/modules/posts/posts.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { ISavedPost, SavesLikesData } from "./savesAndLikes.dto";
import { CommentsService } from "src/modules/reactions/comments/comments.service";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class SavesLikesService {
    constructor(
        private readonly postService: PostService,
        private readonly commentsService: CommentsService,
        @InjectModel(SavesAndLikes.name) private readonly savesLikesModal: Model<SavesAndLikes>,
    ) { }

    getService(postType: string): PostService | CommentsService {
        switch (postType) {
            case "post":
                return this.postService;
            case "comment":
                return this.commentsService;
            default:
                throw new InternalServerErrorException();
        }
    }

    async addReaction(savesLikesData: SavesLikesData): Promise<SavesAndLikes> {
        const { postId, userId, reaction, postType } = savesLikesData;
        const service = this.getService(postType);
        await service.changeReactionCount(postId, reaction, "add");

        let reactionDoc = await this.savesLikesModal.findOne({ postId, userId });

        if (reactionDoc) reactionDoc[reaction] = true;
        else reactionDoc = new this.savesLikesModal({ ...savesLikesData, [reaction]: true });

        return reactionDoc.save();
    }

    async removeReaction(savesLikesData: SavesLikesData): Promise<void> {
        const { postId, userId, reaction, postType } = savesLikesData;
        const service = this.getService(postType);
        await service.changeReactionCount(postId, reaction, "remove");
        const attribute = reaction === "liked" ? "saved" : "liked";

        let reactionDoc = await this.savesLikesModal.findOne({ postId, userId });

        if (reactionDoc?.[attribute]) {
            reactionDoc[reaction] = false;
            reactionDoc.save();
        } else if (reactionDoc) {
            await reactionDoc.deleteOne();
        }
    }

    async checkLikes(userId: string, postIds: string[]): Promise<SavesAndLikes[]> {
        return this.savesLikesModal.find({ userId, postId: { $in: postIds } }).exec();
    }

    async getSavedPosts(userId: string): Promise<ISavedPost[]> {
        return this.savesLikesModal.aggregate([
            { $match: { userId, saved: true } },
            { $lookup: { from: "PostMessages", localField: "postId", foreignField: "_id", as: "post" } },
            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "Users", localField: "post.user", foreignField: "_id", as: "post.user" } },
            { $unwind: { path: "$post.user", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "PostMessages", localField: "post.postId", foreignField: "_id", as: "post.post" } },
            { $unwind: { path: "$post.post", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "Users", localField: "post.post.user", foreignField: "_id", as: "post.post.user" } },
            { $unwind: { path: "$post.post.user", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "post._id": 1,
                    "post.text": 1,
                    "post.images": 1,
                    "post.user._id": 1,
                    "post.user.name": 1,
                    "post.user.picture": 1,
                    "post.user.username": 1,
                    "post.createdAt": 1,
                    "post.poll": 1,
                    "post.comments": 1,
                    "post.reposts": 1,
                    "post.likes": 1,
                    "post.views": 1,
                    "post.saved": 1,
                    "post.post.text": 1,
                    "post.post.images": 1,
                    "post.post.user._id": 1,
                    "post.post.user.name": 1,
                    "post.post.user.picture": 1,
                    "post.post.user.username": 1,
                    "post.post.poll": 1,
                    "post.post.createdAt": 1,
                },
            },
        ]);
    }
}
