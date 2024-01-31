import { Model, ObjectId } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Inject, Injectable, InternalServerErrorException, UseInterceptors, forwardRef } from "@nestjs/common";

import { Post, ScheduledPost } from "./post.schema";
import { CommonService } from "../common/common.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { ConfigService } from "src/modules/config/config.service";
import { Comments } from "../reactions/comments/comments.schema";
import { CommentsService } from "../reactions/comments/comments.service";
import { CustomUnprocessableEntityException } from "src/exception-handlers/422/handler";
import { IDuration, IRepostedCommentPost, ParsedPostDTO, ScheduledPostDTO } from "./post.dto";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class PostService {
    constructor(
        @Inject("Moment") private moment: any,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
        private schedulerRegistery: SchedulerRegistry,
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @Inject(forwardRef(() => CommentsService)) private commentsService: CommentsService,
        @InjectModel(ScheduledPost.name) private readonly scheduledPostModel: Model<ScheduledPost>,
    ) { }

    async findAll(): Promise<Post[]> {
        await this.postModel.updateMany({}, { $inc: { views: 1 } });

        const posts = await this.postModel.aggregate([
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
                    "user._id": 1,
                    "user.bio": 1,
                    "user.name": 1,
                    "user.picture": 1,
                    "user.username": 1,
                    "user.following": 1,
                    "user.followers": 1,
                    "post._id": 1,
                    "post.text": 1,
                    "post.images": 1,
                    "post.createdAt": 1,
                    "post.user._id": 1,
                    "post.user.bio": 1,
                    "post.user.name": 1,
                    "post.user.picture": 1,
                    "post.user.username": 1,
                    "post.user.following": 1,
                    "post.user.followers": 1,
                }
            },
        ]);

        const clonedPosts = JSON.parse(JSON.stringify(posts));

        for (const post of clonedPosts) {
            if (post.postId && !post?.post?._id) {  
                const parentPostData = await this.getRepostedCommentData(post.postId);
                const clonedParentPostData = JSON.parse(JSON.stringify(parentPostData));
                clonedParentPostData["type"] = "comment";
                post.post = clonedParentPostData;
            }
        }

        return clonedPosts;
    }

    async getRepostedCommentData(postId: string): Promise<Comments> {
        const commentData = await this.commentsService.getCommentDetails(postId);
        const clonedCommentData = JSON.parse(JSON.stringify(commentData));

        if (clonedCommentData?.userId) {
            clonedCommentData.user = clonedCommentData.userId;
            delete clonedCommentData["userId"];
        }

        return clonedCommentData;
    }

    async getAllSchduledPosts(userId: ObjectId): Promise<ScheduledPost[]> {
        return this.scheduledPostModel.find({ userId }).exec();
    }

    async create(postData: ParsedPostDTO, userId: ObjectId): Promise<Post> {
        const { postId } = postData;
        const mainData = { ...postData, user: userId, images: postData.images, createdAt: Date.now() };
        if (postId) {
            const operatedPost = await this.postModel.findByIdAndUpdate(postId, { $inc: { reposts: 1 } }, { new: true });
            if (!operatedPost) await this.commentsService.changeReactionCount(postId, "reposted", "add");
        }

        const createdPost = new this.postModel(mainData);
        return createdPost.save();
    }

    async schedulePost(postData: ScheduledPostDTO, userId: ObjectId): Promise<ScheduledPost> {
        const scheduledPost = new this.scheduledPostModel({ ...postData, userId });
        return scheduledPost.save();
    }

    async deleteScheduledPost(postId: ObjectId): Promise<ScheduledPost> {
        const post = await this.scheduledPostModel.findByIdAndDelete(postId);
        const timeoutId = post?.timeoutId ?? '';
        const jobMap = this.schedulerRegistery.getCronJobs();
        if (jobMap.has(timeoutId)) this.schedulerRegistery.getCronJob(timeoutId).stop();
        return post;
    }

    public deleteScheduledPostWithImages = async (postId: ObjectId): Promise<ScheduledPost> => {
        const post = await this.deleteScheduledPost(postId);
        const images = post?.data?.images ?? [];
        images.forEach(image => { this.commonService.unlinkImage("storage/post-images", image); });
        return post;
    }

    private checkVoteTiming(creationDate: string, duration: IDuration): boolean {
        const votingDate = this.moment(new Date());
        const deadlineDate = this.moment(creationDate).add(duration);
        const diff = deadlineDate.diff(votingDate);
        return diff < 0;
    }

    async votePoll(userId: string, postId: string, choiceIndex: number, prevChoiceIndex: number): Promise<Post> {
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
            const { createdAt, poll } = post;
            const creationDate = JSON.parse(JSON.stringify(createdAt));
            const hasDurationPassed = this.checkVoteTiming(creationDate, poll.duration);

            if (hasDurationPassed) {
                const message = "the voting duration has passed for this poll!";
                throw new CustomUnprocessableEntityException({ message });
            }

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
    }

    async changeReactionCount(postId: string, reaction: string, mode: string): Promise<Post> {
        const { attribute, count } = this.configService.getReactionConfig(reaction, mode);
        return await this.postModel.findByIdAndUpdate(postId, { $inc: { [attribute]: count } }, { new: true });
    }

    async getDetails(postId: string): Promise<IRepostedCommentPost | Post> {
        let clonedPost: IRepostedCommentPost;
        const postModelObj = this.postModel.findById(postId);

        const postData = await postModelObj
            .populate("user", "_id name username picture")
            .populate({
                path: "postId",
                select: "_id text user poll createdAt",
                populate: {
                    path: "user",
                    select: "_id name username picture",
                },
            })
            .lean()
            .exec();

        clonedPost = JSON.parse(JSON.stringify(postData));
        clonedPost["parentPost"] = clonedPost["postId"];
        if (clonedPost["postId"]) delete clonedPost["postId"];

        if (clonedPost) {
            const repostId = (await this.postModel.findById(postId))?.postId?.toString();
            if (repostId && clonedPost?.parentPost == null) {
                const parentPostData = await this.getRepostedCommentData(repostId);
                const clonedParentPostData = JSON.parse(JSON.stringify(parentPostData));
                if (clonedParentPostData) clonedParentPostData["type"] = "comment";
                clonedPost["parentPost"] = clonedParentPostData;
                if (clonedPost?.parentPost?.images?.length) clonedPost.parentPost.images = [];
            }
        }

        return clonedPost;
    }

    async getUserPostDetails(userId: string): Promise<Post[]> {
        const posts = await this.postModel.aggregate([
            { $match: { $expr: { $eq: ["$user", { $toObjectId: userId }] } } },
            { $lookup: { localField: "postId", foreignField: "_id", from: "PostMessages", as: "post" } },
            { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "Users", localField: "user", foreignField: "_id", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "Users", localField: "post.user", foreignField: "_id", as: "post.user" } },
            { $unwind: { path: "$post.user", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    "text": 1,
                    "images": 1,
                    "poll": 1,
                    "createdAt": 1,
                    "comments": 1,
                    "reposts": 1,
                    "likes": 1,
                    "views": 1,
                    "saved": 1,
                    "postId": 1,
                    "post._id": 1,
                    "post.text": 1,
                    "user._id": 1,
                    "user.name": 1,
                    "user.picture": 1,
                    "user.username": 1,
                    "post.user._id": 1,
                    "post.user.name": 1,
                    "post.user.picture": 1,
                    "post.user.username": 1,
                    "post.images": 1,
                    "post.poll": 1,
                    "post.createdAt": 1,
                    "post.comments": 1,
                    "post.reposts": 1,
                    "post.likes": 1,
                    "post.views": 1,
                    "post.saved": 1,
                },
            },
        ]);

        const clonedPosts = JSON.parse(JSON.stringify(posts));

        for (const post of clonedPosts) {
            if (post.postId && !post?.post?._id) {
                post.post = await this.getRepostedCommentData(post.postId);
            }
        }

        return clonedPosts;
    }
}
