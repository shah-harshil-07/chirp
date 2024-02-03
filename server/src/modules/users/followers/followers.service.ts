import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, UseInterceptors } from "@nestjs/common";

import { FollowerModel } from "./followers.schema";
import { FollowDataFetchDTO } from "./followers.dto";
import { ResponseInterceptor } from "src/interceptors/response";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class FollowersService {
    constructor(@InjectModel(FollowerModel.name) private readonly followerModel: Model<FollowerModel>) { }

    public async checkUserfollowing(followerId: string, followingId: string): Promise<FollowerModel> {
        return await this.followerModel.findOne({ follower: followerId, following: followingId }).exec();
    }

    public async followUser(followerId: string, followingId: string): Promise<FollowerModel> {
        return await this.followerModel.create({ follower: followerId, following: followingId });
    }

    public async unFollowUser(followerId: string, followingId: string): Promise<boolean> {
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
            { $project: { "isFollowed": 1, "user._id": 1, "user.name": 1, "user.username": 1, "user.picture": 1 } },
        ]);
    }
}
