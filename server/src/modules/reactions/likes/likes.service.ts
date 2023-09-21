import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, UseInterceptors } from "@nestjs/common";

import { Likes } from "./likes.schema";
import { LikesData } from "./likes.dto";
import { PostService } from "src/modules/posts/posts.service";
import { ResponseInterceptor } from "src/interceptors/response";

@Injectable()
export class LikesService {
    constructor(
        private readonly postService: PostService,
        @InjectModel(Likes.name) private readonly likesModal: Model<Likes>,
    ) { }

    @UseInterceptors(ResponseInterceptor)
    async addLike(likesData: LikesData): Promise<Likes> {
        const { postId } = likesData;
        await this.postService.changeLikeCount(postId, "add");
        const addedLike = new this.likesModal(likesData);
        return addedLike.save();
    }
}
