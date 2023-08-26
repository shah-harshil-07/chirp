import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Comments } from "./comments.schema";
import { ICommentData } from "./comments.dto";

@Injectable()
export class CommentsService {
    constructor(@InjectModel(Comments.name) private readonly commentModel: Model<Comments>) { }

    async create(commentData: ICommentData): Promise<Comments> {
        console.log(commentData);
        const createdComment = new this.commentModel(commentData);
        return createdComment.save();
    }
}
