import { join } from "path";
import { AuthGuard } from "@nestjs/passport";
import { createReadStream, existsSync } from "fs";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
    Req,
    Get,
    Body,
    Post,
    Param,
    Delete,
    UseGuards,
    Controller,
    UploadedFiles,
    StreamableFile,
    UseInterceptors,
    UnprocessableEntityException,
} from "@nestjs/common";

import { UsersService } from "./users.service";
import { topupValidationStr } from "src/constants";
import { AuthService } from "src/modules/auth/auth.service";
import { IFollowingParamId } from "./followers/followers.dto";
import { ResponseInterceptor } from "src/interceptors/response";
import { FollowersService } from "./followers/followers.service";
import { ConfigService } from "src/modules/config/config.service";
import { GetAuthTokenGuard } from "src/modules/auth/get-token.guard";
import { CustomBadRequestException } from "src/exception-handlers/400/handler";
import { CustomUnprocessableEntityException } from "src/exception-handlers/422/handler";
import { CustomValidatorsService } from "../custom-validators/custom-validators.service";
import {
    OtpDTO,
    UserDTO,
    IParamId,
    IUserPostParams,
    LoggedInUserDTO,
    RegisteredUserDTO,
    GoogleAuthedUserDTO,
    IDeleteImgDetailsDTO,
    IUpdateUserDetailsDTO,
    RegisteredGoogleAuthedUserDTO,
    ISearchUserDTO,
} from "./users.dto";

interface IResponseProps {
    data?: any;
    errors?: any;
    message: string;
    success: boolean;
};

@Controller("user")
export class UsersController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
        private readonly followerService: FollowersService,
        private readonly topupCountValidatorService: CustomValidatorsService,
    ) {
        this.topupCountValidatorService = new CustomValidatorsService({ topupCount: topupValidationStr });
    }

    @Post("verify-email")
    @UseInterceptors(ResponseInterceptor)
    async verifyEmail(@Body() userData: UserDTO): Promise<IResponseProps> {
        const otpData = await this.userService.sendOtp(userData.email, userData.name);
        return { success: true, data: otpData, message: "Otp sent successfully." };
    }

    @Post("check-otp/:id")
    @UseInterceptors(ResponseInterceptor)
    async checkOtp(@Body() requestData: OtpDTO, @Param() { id }: IParamId): Promise<IResponseProps> {
        const otpData = await this.userService.findOtpValue(id);
        const createdTime = otpData.createdAt;
        const currentTime = Date.now();
        const timeDiff = ((currentTime - createdTime) / 1000);

        const data = { valid: (timeDiff <= 60 && requestData.otp === otpData.otp) };
        return { data, success: true, message: "OTP verified successfully." };
    }

    @Post("register")
    @UseInterceptors(ResponseInterceptor)
    async register(@Body() requestData: RegisteredUserDTO): Promise<IResponseProps> {
        const userObj = await this.userService.createUser(requestData);
        const accessToken = this.authService.generateToken(userObj);
        const data = { user: userObj, token: accessToken };
        return { data, success: true, message: "Registeration done successfully!" };
    }

    @Post("check-user-credentials")
    @UseInterceptors(ResponseInterceptor)
    async checkUniqueness(@Body() requestData: UserDTO): Promise<IResponseProps> {
        const userUnique = await this.userService.checkUserUniquness(requestData);
        const message = userUnique ? "The user credentials are unique." : "Please change either username or email.";
        const data = { userUnique }
        return { data, message, success: true };
    }

    @Post("check-google-credentials")
    @UseInterceptors(ResponseInterceptor)
    async checkGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<IResponseProps> {
        const userData = await this.userService.getGoogleCredentials(requestData);
        const data = { userAvailable: userData ? true : false };
        const message = userData ? "The user already exists." : "The user is unavailable.";
        return { data, message, success: true };
    }

    @Post("register-google-authed-user")
    @UseInterceptors(ResponseInterceptor)
    async registerGoogleAuthedUser(@Body() requestData: RegisteredGoogleAuthedUserDTO): Promise<IResponseProps> {
        const usernameAvailable = await this.userService.checkUsernameAvailable(requestData.username);
        if (usernameAvailable) {
            return { success: false, message: "User registeration failed.", errors: ["Username already exists."] };
        }

        const userObj = await this.userService.createGoogleAuthedUser(requestData);
        const accessToken = this.authService.generateToken(userObj);
        const data = { user: userObj, token: accessToken };
        return { data, success: true, message: "User registered successfully." };
    }

    @Post("login")
    @UseInterceptors(ResponseInterceptor)
    async login(@Body() requestData: LoggedInUserDTO): Promise<IResponseProps> {
        let accessToken = null;
        const userObj = await this.userService.findUser(requestData);
        if (userObj) accessToken = this.authService.generateToken(userObj);
        const message = userObj ? "User logged in successfully!" : "Credentials are incorrect.";

        const data = { userValid: userObj ? true : false, userData: userObj };
        if (accessToken) data["accessToken"] = accessToken;
        return { data, message, success: true };
    }

    @Post("login-with-google-cred")
    @UseInterceptors(ResponseInterceptor)
    async loginWithGoogleCredentials(@Body() requestData: GoogleAuthedUserDTO): Promise<IResponseProps> {
        const userData = await this.userService.getGoogleAuthedUserData(requestData);

        if (userData) {
            const accessToken = this.authService.generateToken(userData);
            const data = { user: userData, token: accessToken };
            return { data, success: true, message: "User logged in successfully." };
        } else {
            return { success: false, message: "User does not exist" };
        }
    }

    @Get("get-details/:id")
    @UseInterceptors(ResponseInterceptor)
    async getUserDetails(@Param() { id }: IParamId): Promise<IResponseProps> {
        const userData = await this.userService.getUserDetails(id);
        return { success: true, data: userData, message: "User details fetched successfully." };
    }

    @Get("get-posts/:id/:topupCount")
    @UseInterceptors(ResponseInterceptor)
    async getPosts(@Param() paramData: IUserPostParams): Promise<IResponseProps> {
        const { isValid, errors } = this.topupCountValidatorService.validate(paramData);
        if (!isValid) throw new CustomBadRequestException(errors);

        const { id, topupCount } = paramData;
        const userPosts = await this.userService.getUserPosts(id, topupCount);
        return { success: true, data: userPosts, message: "User posts fetched successfully." };
    }

    @Get("get-saved/:id/:topupCount")
    @UseInterceptors(ResponseInterceptor)
    async getSavedPosts(@Param() paramData: IUserPostParams): Promise<IResponseProps> {
        const { isValid, errors } = this.topupCountValidatorService.validate(paramData);
        if (!isValid) throw new CustomBadRequestException(errors);

        const { id, topupCount } = paramData;
        const posts = await this.userService.getUserSavedPosts(id, topupCount);
        return { success: true, data: posts, message: "Saved posts fetched successfully." };
    }

    @Get("get-comments/:id/:topupCount")
    @UseInterceptors(ResponseInterceptor)
    async getComments(@Param() paramData: IUserPostParams): Promise<IResponseProps> {
        const { isValid, errors } = this.topupCountValidatorService.validate(paramData);
        if (!isValid) throw new CustomBadRequestException(errors);

        const { id, topupCount } = paramData;
        const data = await this.userService.getComments(id, topupCount);
        return { success: true, data, message: "User comments fetched successfully." };
    }

    @UseGuards(AuthGuard("jwt"))
    @Post("update-details/:id")
    @UseInterceptors(
        ResponseInterceptor,
        FileFieldsInterceptor(
            [{ name: "picture", maxCount: 1 }, { name: "backgroundImage", maxCount: 1 }],
            ConfigService.getFileStorageConfigObj("user-images"),
        ),
    )
    async updateDetails(
        @Param() { id }: IParamId,
        @Body() requestData: IUpdateUserDetailsDTO,
        @UploadedFiles() files: {
            picture?: Express.Multer.File[],
            backgroundImage?: Express.Multer.File[]
        }
    ): Promise<IResponseProps> {
        const detailsData: IUpdateUserDetailsDTO = {
            ...requestData,
            picture: files?.picture?.[0]?.filename ?? '',
            backgroundImage: files?.backgroundImage?.[0]?.filename ?? '',
        };

        const data = await this.userService.updateDetails(id, detailsData);
        return { success: true, data, message: "User details updated successfully." };
    }

    @Get("get-image/:filename")
    getUserImage(@Param() { filename }: any): StreamableFile {
        const path = join(process.cwd(), `storage/user-images/${filename}`);

        if (existsSync(path)) {
            const file = createReadStream(path, "base64");
            return new StreamableFile(file);
        }

        throw new UnprocessableEntityException();
    }

    @Delete("delete-image/:id")
    @UseInterceptors(ResponseInterceptor)
    async deleteUserImage(
        @Param() { id }: IParamId,
        @Body() requestData: IDeleteImgDetailsDTO,
    ): Promise<IResponseProps> {
        await this.userService.deleteUserImage(id, requestData.fileName, requestData.imageType);
        return { success: true, data: null, message: "Image deleted successfully." };
    }

    private async checkFollowIdValidity(followerId: string, followingId: string): Promise<void> {
        const followerExists = await this.userService.checkUserExists(followerId);
        const followingExists = await this.userService.checkUserExists(followingId);

        if (!followerExists || !followingExists) {
            throw new CustomUnprocessableEntityException("The user id is not valid.");
        }
    }

    @Get("follow/:followingId")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async followUser(@Req() req: any, @Param() { followingId }: IFollowingParamId): Promise<IResponseProps> {
        const { _id: followerId } = req.user;
        await this.checkFollowIdValidity(followerId, followingId);

        let isValidaData = true, message = '';
        if (await this.followerService.checkUserfollowing(followerId, followingId)) {
            isValidaData = false;
            message = "You are already following the requested user.";
        } else if (followerId === followingId) {
            isValidaData = false;
            message = "follower id and following id cannot be same.";
        }

        if (!isValidaData && message) {
            return { success: false, data: null, message };
        } else {
            const followDoc = await this.followerService.followUser(followerId, followingId);
            return { success: true, data: followDoc, message: "Follow action completed successfully." };
        }
    }

    @Get("check-following/:followingId")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async checkUserFollowing(@Req() req: any, @Param() { followingId }: IFollowingParamId): Promise<IResponseProps> {
        const { _id: followerId } = req.user;
        await this.checkFollowIdValidity(followerId, followingId);

        const data = await this.followerService.checkUserfollowing(followerId, followingId);
        const userFollows = Boolean(data);
        return {
            success: true,
            data: { follows: userFollows },
            message: "user following data fetched successfully."
        };
    }

    @Get("unfollow-user/:followingId")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async unFollowUser(@Req() req: any, @Param() { followingId }: IFollowingParamId): Promise<IResponseProps> {
        const { _id: followerId } = req.user;
        await this.checkFollowIdValidity(followerId, followingId);

        const isDeleted = await this.followerService.unFollowUser(followerId, followingId);
        const message = isDeleted ?
            "The unfollow process has been completed successfully." :
            "The unfollow process has failed.";

        return { success: isDeleted, data: { unfollowed: isDeleted }, message };
    }

    @Get("get-followers/:id")
    @UseGuards(GetAuthTokenGuard)
    @UseInterceptors(ResponseInterceptor)
    async getAllFollowers(@Req() req: any, @Param() { id }: IParamId): Promise<IResponseProps> {
        const { _id: loggedInUserId } = req?.user ?? {};
        const followerList = await this.followerService.getAllFollowers({ userId: id, type: "following", loggedInUserId });
        return { success: true, data: followerList, message: "Followers fetched successfully." };
    }

    @Get("get-following/:id")
    @UseGuards(GetAuthTokenGuard)
    @UseInterceptors(ResponseInterceptor)
    async getAllFollowing(@Req() req: any, @Param() { id }: IParamId): Promise<IResponseProps> {
        const { _id: loggedInUserId } = req?.user ?? {};
        const followingList = await this.followerService.getAllFollowers({ userId: id, type: "follower", loggedInUserId });
        return { success: true, data: followingList, message: "Followings fetched successfully." };
    }

    @Get("get-mutual-connections/:id")
    @UseGuards(GetAuthTokenGuard)
    @UseInterceptors(ResponseInterceptor)
    async getMutualConnections(@Req() req: any, @Param() { id }: IParamId): Promise<IResponseProps> {
        const { _id: loggedInUserId } = req?.user ?? {};
        const connectionList = await this.followerService.getMutualConnections(id, loggedInUserId);
        return { success: true, data: connectionList, message: "Mutual connections fetched successfully." };
    }

    @Get("get-follow-suggestions")
    @UseGuards(GetAuthTokenGuard)
    @UseInterceptors(ResponseInterceptor)
    async getFollowSuggestions(@Req() req: any): Promise<IResponseProps> {
        const { _id: loggedInUserId } = req?.user ?? {};
        let users: UserDTO[];
        if (loggedInUserId) users = await this.followerService.getFollowSuggestions(loggedInUserId);
        else users = await this.userService.getFollowSuggestions();
        return { success: true, data: users, message: "Suggested users to be followed fetched successfully." };
    }

    @Get("get-user-suggestions")
    @UseInterceptors(ResponseInterceptor)
    async getUserSuggestions(@Body() searchData: ISearchUserDTO): Promise<IResponseProps> {
        const users = await this.userService.getUserSuggestions(searchData.searchValue);
        return { success: true, data: users, message: "Searched users fetched successfully." };
    }
}
