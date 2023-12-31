import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

import * as Constants from "src/constants";
import { Post } from "src/modules/posts/post.schema";
import { CustomMatch } from "src/decorators/validators";

export class UserDTO {
    @IsNotEmpty()
    @CustomMatch(Constants.NAME_REGEX, { message: Constants.NAME_ERR_MESSAGE })
    name: string;

    @IsNotEmpty()
    @CustomMatch(Constants.USERNAME_REGEX, { message: Constants.USERNAME_ERR_MESSAGE })
    username: string;

    @IsNotEmpty()
    @IsEmail({}, { message: Constants.EMAIL_ERR_MESSAGE })
    email: string;

    @IsString()
    @IsOptional()
    picture: string;
}

export class RegisteredUserDTO extends UserDTO {
    @IsNotEmpty()
    @Matches(Constants.PASSWORD_REGEX, { message: Constants.PASSWORD_ERR_MESSAGE })
    password: string;
}

export class LoggedInUserDTO {
    @IsNotEmpty()
    cred: string;

    @IsNotEmpty()
    password: string;
}

export class OtpDTO {
    @Length(4, 4)
    otp: string;
}

export class GoogleAuthedUserDTO {
    @IsNotEmpty()
    @CustomMatch(Constants.NAME_REGEX, { message: Constants.NAME_ERR_MESSAGE })
    name: string;

    @IsNotEmpty()
    @IsEmail({}, { message: Constants.EMAIL_ERR_MESSAGE })
    email: string;

    @IsNotEmpty()
    googleId: string;
}

export class RegisteredGoogleAuthedUserDTO extends GoogleAuthedUserDTO {
    @IsNotEmpty()
    @CustomMatch(Constants.USERNAME_REGEX, { message: Constants.USERNAME_ERR_MESSAGE })
    username: string;
}

export interface IUserDetails {
    name: string;
    username: string;
    bio: string;
    dateOfBirth: string | null;
    followers: number;
    following: number;
    location: string;
    website: string;
    createdAt: Date | null;
    totalPosts: number;
}

export interface IUserPosts {
    posts: Post[];
}