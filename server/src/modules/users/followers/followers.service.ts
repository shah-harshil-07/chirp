import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, UseInterceptors } from "@nestjs/common";

import { UserModel } from "../users.schema";
import { FollowerModel } from "./followers.schema";
import { FollowDataFetchDTO } from "./followers.dto";
import { ResponseInterceptor } from "src/interceptors/response";
import { UserDTO } from "../users.dto";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class FollowersService {
    constructor(
        @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
        @InjectModel(FollowerModel.name) private readonly followerModel: Model<FollowerModel>,
    ) { }

    public async checkUserfollowing(followerId: string, followingId: string): Promise<FollowerModel> {
        return await this.followerModel.findOne({ follower: followerId, following: followingId }).exec();
    }

    public async followUser(followerId: string, followingId: string): Promise<FollowerModel> {
        await this.userModel.findByIdAndUpdate(followerId, { $inc: { following: 1 } });
        await this.userModel.findByIdAndUpdate(followingId, { $inc: { followers: 1 } });
        return await this.followerModel.create({ follower: followerId, following: followingId });
    }

    public async unFollowUser(followerId: string, followingId: string): Promise<boolean> {
        await this.userModel.findByIdAndUpdate(followerId, { $inc: { following: -1 } });
        await this.userModel.findByIdAndUpdate(followingId, { $inc: { followers: -1 } });
        const { deletedCount } = await this.followerModel.deleteOne({ follower: followerId, following: followingId });
        return Boolean(deletedCount);
    }

    public async getAllFollowers({ userId, type, loggedInUserId }: FollowDataFetchDTO): Promise<FollowerModel[]> {
        const isFollowingQuerySet = loggedInUserId && loggedInUserId !== userId ? [
            { $lookup: { localField: "user._id", foreignField: "following", from: "Followers", as: "followData" } },
            {
                $addFields: {
                    isFollowed: {
                        $cond: {
                            if: { $ne: [{ $indexOfArray: ["$followData.follower", { $toObjectId: loggedInUserId }] }, -1] },
                            then: true,
                            else: false,
                        }
                    }
                }
            }
        ] : [];

        const lookupFeild = type === "follower" ? "following" : "follower";

        return await this.followerModel.aggregate([
            { $match: { $expr: { $eq: [`$${type}`, { $toObjectId: userId }] } } },
            { $lookup: { localField: lookupFeild, foreignField: "_id", from: "Users", as: "user" } },
            { $unwind: "$user" },
            ...isFollowingQuerySet,
            {
                $project: {
                    "isFollowed": 1,
                    "user._id": 1,
                    "user.name": 1,
                    "user.username": 1,
                    "user.picture": 1,
                    "user.bio": 1
                }
            },
        ]);
    }

    public async getMutualConnections(userId: string, loggedInUserId: string): Promise<UserModel[]> {
        const mutualConnectionData = await this.followerModel.aggregate([
            {
                $match: {
                    $or: [
                        { $expr: { $eq: ["$following", { $toObjectId: userId }] } },
                        { $expr: { $eq: ["$follower", { $toObjectId: loggedInUserId }] } },
                    ]
                }
            },
            {
                $facet: {
                    followerGroup: [
                        { $group: { _id: "$follower", following_arr: { $push: "$following" } } },
                        { $match: { $expr: { $eq: ["$_id", { $toObjectId: loggedInUserId }] } } }
                    ],
                    followingGroup: [
                        { $group: { _id: "$following", follower_arr: { $push: "$follower" } } },
                        { $match: { $expr: { $eq: ["$_id", { $toObjectId: userId }] } } }
                    ],
                },
            },
            { $unwind: "$followerGroup" },
            { $unwind: "$followingGroup" },
            {
                $project: {
                    common_users: {
                        $setIntersection: ["$followerGroup.following_arr", "$followingGroup.follower_arr"]
                    }
                }
            }
        ]);

        const mutualConnectionIdList = mutualConnectionData?.[0]?.common_users ?? [];
        if (mutualConnectionIdList?.length) {
            return await this
                .userModel
                .find({ _id: { $in: mutualConnectionIdList } })
                .select("_id name username bio picture");
        } else {
            return [];
        }
    }

    public async getFollowSuggestions(loggedInUserId: string): Promise<UserDTO[]> {
        const userList = await this.followerModel.aggregate([
            { $group: { _id: "$following", follower_count: { $sum: 1 }, followers: { $push: "$follower" } } },
            { $match: { $expr: { $eq: [{ $in: [{ $toObjectId: loggedInUserId }, "$followers"] }, false] } } },
            { $match: { $expr: { $ne: ["$_id", { $toObjectId: loggedInUserId }] } } },
            { $sort: { follower_count: -1 } },
            { $limit: 20 },
            { $lookup: { from: "Users", localField: "_id", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            {
                $project: {
                    "_id": 0,
                    "user._id": 1,
                    "user.name": 1,
                    "user.picture": 1,
                    "user.username": 1,
                },
            },
        ]);

        return userList.map(userObj => userObj.user);
    }
}
