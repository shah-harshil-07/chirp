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

    public async getAllFollowers({userId, type}: FollowDataFetchDTO): Promise<any> {
        return await this.followerModel.aggregate([
            { $match: { $expr: { $eq: [`$${type}`, { $toObjectId: userId }] } } },
            { $lookup: { localField: "follower", foreignField: "_id", from: "Users", as: "user" } },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "user._id": 1,
                    "user.name": 1,
                    "user.username": 1,
                    "user.picture": 1,
                },
            },
        ]);
    }
}
