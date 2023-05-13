import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";

import { Post, ScheduledPost } from "./post.schema";
import { ParsedPostDTO, PostDTO, ScheduledPostDTO } from "./post.dto";

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(ScheduledPost.name) private readonly scheduledPostModel: Model<ScheduledPost>,
    ) { }

    async findAll(): Promise<Post[]> {
        return this.postModel.find().exec();
    }

    async create(postData: ParsedPostDTO, userId: ObjectId): Promise<Post> {
        try {            
            const mainData = { ...postData, userId, images: postData.images };
            const createdPost = new this.postModel(mainData);
            return createdPost.save();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async schedulePost(postData: ScheduledPostDTO): Promise<ScheduledPost> {
        try {            
            const scheduledPost = new this.scheduledPostModel(postData);
            return scheduledPost.save();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async deleteScheduledPost(postId: ObjectId): Promise<void> {
        try {
            return this.scheduledPostModel.findByIdAndDelete(postId);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async update(postData: PostDTO, id: string): Promise<Post> {
        return this.postModel.findOneAndUpdate({ _id: id }, postData);
    }

    async delete(id: string): Promise<Post> {
        return this.postModel.findOneAndDelete({ _id: id });
    }
}
