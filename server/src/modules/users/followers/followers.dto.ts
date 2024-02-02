import { IsIn, IsNotEmpty } from "class-validator";

export interface IFollowingParamId {
    followingId: string;
}

export class FollowDataFetchDTO {
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    @IsIn(["following", "follower"])
    type: string;
}