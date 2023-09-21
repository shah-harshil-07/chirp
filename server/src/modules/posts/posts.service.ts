import { Model, ObjectId } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { Post, ScheduledPost } from "./post.schema";
import { CommonService } from "../common/common.service";
import { ParsedPostDTO, PostDTO, ScheduledPostDTO } from "./post.dto";

@Injectable()
export class PostService {
    constructor(
        private readonly commonService: CommonService,
        private schedulerRegistery: SchedulerRegistry,
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(ScheduledPost.name) private readonly scheduledPostModel: Model<ScheduledPost>,
    ) { }

    async findAll(): Promise<Post[]> {
        return this
            .postModel
            .find()
            .populate("user", "name username picture")
            .populate({
                path: "postId",
                select: "text images createdAt",
                populate: { path: "user", select: "name username picture" }
            })
            .sort("-createdAt")
            .lean() // converts document received by query into plain JS object.
            .exec() // executes the query. Returns a promise.
            .then(posts => {
                posts.forEach(post => { post["post"] = post["postId"]; delete post.postId; });
                return posts;
            });
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

    async votePoll(userId: string, postId: string, choiceIndex: number, prevChoiceIndex: number): Promise<Post> {
        try {
            let newPost: Post;
            const post = await this.postModel.findOne({ _id: postId, "poll.users.userId": userId }).exec();

            if (post === null) {
                newPost = await this.postModel.findByIdAndUpdate(
                    postId,
                    {
                        $addToSet: { "poll.users": { userId, choiceIndex } },
                        $inc: { [`poll.choices.${choiceIndex}.votes`]: 1 }
                    },
                    { new: true }
                );
            } else if (prevChoiceIndex >= 0) {
                newPost = await this.postModel.findByIdAndUpdate(
                    postId,
                    {
                        $set: {
                            "poll.users.$[elem].choiceIndex": choiceIndex
                        },
                        $inc: {
                            [`poll.choices.${choiceIndex}.votes`]: 1,
                            [`poll.choices.${prevChoiceIndex}.votes`]: -1
                        },
                    },
                    { arrayFilters: [{ "elem.userId": userId }], new: true }
                );
            } else {
                throw new InternalServerErrorException();
            }

            return newPost;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
