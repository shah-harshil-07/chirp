import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, UseInterceptors } from "@nestjs/common";

import { SavesLikesData } from "./savesAndLikes.dto";
import { SavesAndLikes } from "./savesAndLikes.schema";
import { PostService } from "src/modules/posts/posts.service";
import { ResponseInterceptor } from "src/interceptors/response";

@Injectable()
export class SavesLikesService {
    constructor(
        private readonly postService: PostService,
        @InjectModel(SavesAndLikes.name) private readonly savesLikesModal: Model<SavesAndLikes>,
    ) { }

    async addReaction(savesLikesData: SavesLikesData): Promise<SavesAndLikes> {
        const { postId, userId, reaction } = savesLikesData;
        await this.postService.changeReactionCount(postId, reaction, "add");

        let reactionDoc = await this.savesLikesModal.findOne({ postId, userId });

        if (reactionDoc) reactionDoc[reaction] = true;
        else reactionDoc = new this.savesLikesModal({ ...savesLikesData, [reaction]: true });

        return reactionDoc.save();
    }

    async removeReaction(savesLikesData: SavesLikesData): Promise<void> {
        const { postId, userId, reaction } = savesLikesData;
        await this.postService.changeReactionCount(postId, reaction, "remove");
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
}
