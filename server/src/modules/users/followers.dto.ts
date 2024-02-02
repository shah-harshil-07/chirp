import { IsIn, IsMongoId, IsNotEmpty } from "class-validator";

export class FollowActionDTO {
    @IsNotEmpty()
    @IsMongoId({ message: "The follower id is improper" })
    followerId: string;

    @IsNotEmpty()
    @IsMongoId({ message: "The following id is improper" })
    followingId: string;
}

export class FollowDataFetchDTO {
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    @IsIn(["following", "follower"])
    type: string;
}