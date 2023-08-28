import { Model } from "mongoose";
import { Injectable, InternalServerErrorException, UseInterceptors } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Comments } from "./comments.schema";
import { ICommentData } from "./comments.dto";
import { ResponseInterceptor } from "src/interceptors/response";

@Injectable()
export class CommentsService {
    constructor(@InjectModel(Comments.name) private readonly commentModel: Model<Comments>) { }

    @UseInterceptors(ResponseInterceptor)
    async create(commentData: ICommentData): Promise<Comments> {
        try {
            const createdComment = new this.commentModel(commentData);
            return createdComment.save();
        } catch (error: any) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
