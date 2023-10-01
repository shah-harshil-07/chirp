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
        await this.postModel.updateMany({}, { $inc: { views: 1 } });

        return this.postModel.aggregate([
            { $lookup: { from: "Users", localField: "user", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $lookup: { from: "PostMessages", localField: "postId", foreignField: "_id", as: "post" } },
            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "Users", localField: "post.user", foreignField: "_id", as: "post.user" } },
            { $unwind: { path: "$post.user", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    "_id": 1,
                    "text": 1,
                    "poll": 1,
                    "postId": 1,
                    "images": 1,
                    "likes": 1,
                    "saved": 1,
                    "views": 1,
                    "reposts": 1,
                    "comments": 1,
                    "createdAt": 1,
                    "user.name": 1,
                    "user.username": 1,
                    "user.picture": 1,
                    "post.text": 1,
                    "post.images": 1,
                    "post.user.name": 1,
                    "post.user.username": 1,
                    "post.user.picture": 1,
                }
            },
        ]);
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
        const { postId } = postData;
        const mainData = { ...postData, user: userId, images: postData.images, createdAt: Date.now() };
        if (postId) await this.postModel.findByIdAndUpdate(postId, { $inc: { reposts: 1 } });
        const createdPost = new this.postModel(mainData);
        return createdPost.save();
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

    async changeReactionCount(postId: string, reaction: string, mode: string): Promise<Post> {
        let attribute: string;
        switch (reaction) {
            case "liked":
                attribute = "likes";
                break;
            case "saved":
                attribute = "saved";
                break;
            case "commented":
                attribute = "comments";
                break;
            default:
                throw new InternalServerErrorException();

        }

        const count = mode === "add" ? 1 : mode === "remove" ? -1 : 0;
        const newPost = await this.postModel.findByIdAndUpdate(postId, { $inc: { [attribute]: count } }, { new: true });
        return newPost;
    }
}
