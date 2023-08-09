import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { SchedulerRegistry } from "@nestjs/schedule";

import { Post, ScheduledPost } from "./post.schema";
import { ParsedPostDTO, PostDTO, ScheduledPostDTO } from "./post.dto";
import { CommonService } from "../common/common.service";

@Injectable()
export class PostService {
    constructor(
        private readonly commonService: CommonService,
        private schedulerRegistery: SchedulerRegistry,
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(ScheduledPost.name) private readonly scheduledPostModel: Model<ScheduledPost>,
    ) { }

    async findAll(): Promise<Post[]> {
        return this.postModel.find().populate("user", "name username picture").exec();
    }

    async getAllSchduledPosts(userId: ObjectId): Promise<ScheduledPost[]> {
        try {
            return this.scheduledPostModel.find({ userId }).exec();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async create(postData: ParsedPostDTO, userId: ObjectId): Promise<Post> {
        try {
            const mainData = { ...postData, user: userId, images: postData.images, createdAt: Date.now() };
            const createdPost = new this.postModel(mainData);
            return createdPost.save();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async schedulePost(postData: ScheduledPostDTO, userId: ObjectId): Promise<ScheduledPost> {
        try {
            const scheduledPost = new this.scheduledPostModel({ ...postData, userId });
            return scheduledPost.save();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    async deleteScheduledPost(postId: ObjectId): Promise<ScheduledPost> {
        try {
            const post = await this.scheduledPostModel.findByIdAndDelete(postId);
            const timeoutId = post?.timeoutId ?? '';
            const jobMap = this.schedulerRegistery.getCronJobs();
            if (jobMap.has(timeoutId)) this.schedulerRegistery.getCronJob(timeoutId).stop();
            return post;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public deleteScheduledPostWithImages = async (postId: ObjectId): Promise<ScheduledPost> => {
        try {
            const post = await this.deleteScheduledPost(postId);
            const images = post?.data?.images ?? [];

            if (images?.length) {
                images.forEach(image => {
                    this.commonService.unlinkImage("storage/post-images", image);
                });
            }

            return post;
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

    async votePoll(userId: string, postId: string, choiceIndex: number): Promise<Post> {
        try {
            const post = this.postModel.findOneAndUpdate(
                { _id: postId },
                { $set: { "poll.users.$[elem].choiceIndex": choiceIndex } },
                {
                    arrayFilters: [{ "elem.userId": userId }],
                    returnNewDocument: true,
                    upsert: true,
                },
            );

            return post;
        } catch (error) {
            return null;
        }
    }
}
