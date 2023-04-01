import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post } from "./post.schema";
import { PostDTO } from "./post.dto";

@Injectable()
export class PostService {
    constructor(@InjectModel(Post.name) private readonly postModel: Model<Post>) { }

    async findAll(): Promise<Post[]> {
        return this.postModel.find().exec();
    }

    async create(postData: PostDTO): Promise<Post> {
        const createdPost = new this.postModel(postData);
        return createdPost.save();
    }

    async update(postData: PostDTO, id: string): Promise<Post> {
        return this.postModel.findOneAndUpdate({ _id: id }, postData);
    }

    async delete(id: string): Promise<Post> {
        return this.postModel.findOneAndDelete({ _id: id });
    }
}
