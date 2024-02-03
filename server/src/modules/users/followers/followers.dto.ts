import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export interface IFollowingParamId {
    followingId: string;
}

export class FollowDataFetchDTO {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(["following", "follower"])
    type: string;

    @IsOptional()
    @IsString()
    loggedInUserId: string;
}