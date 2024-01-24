import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, UseInterceptors } from "@nestjs/common";

import { UserModel } from "./users.schema";
import { Post } from "../posts/post.schema";
import { PostService } from "../posts/posts.service";
import { OtpStore } from "../common/otp-store.schema";
import { CommonService } from "../common/common.service";
import { ConfigService } from "../config/config.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { IUserComment } from "../reactions/comments/comments.dto";
import { CommentsService } from "../reactions/comments/comments.service";
import { ISavedPost } from "../reactions/savesAndLikes/savesAndLikes.dto";
import { CustomBadRequestException } from "src/exception-handlers/400/handler";
import { CustomUnprocessableEntityException } from "src/exception-handlers/422/handler";
import { CustomValidatorsService } from "../custom-validators/custom-validators.service";
import { SavesLikesService } from "src/modules/reactions/savesAndLikes/savesAndLikes.service";
import {
    UserDTO,
    IUserDetails,
    LoggedInUserDTO,
    RegisteredUserDTO,
    GoogleAuthedUserDTO,
    validationParamList,
    IUpdateUserDetailsDTO,
    RegisteredGoogleAuthedUserDTO,
} from "./users.dto";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class UsersService {
    private imageDirectory = "storage/user-images";

    constructor(
        private readonly postService: PostService,
        private readonly mailerService: MailerService,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
        private readonly commentService: CommentsService,
        private readonly savesLikesService: SavesLikesService,
        @InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>,
        @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
    ) { }

    public async sendOtp(emailId: string, username: string): Promise<{ otpId: string }> {
        const otp = this.commonService.createFourDigitOtp();
        const otpId = await this.commonService.postOtp(otp);
        const smtpConfig = this.configService.getConfigObj("smtp");

        await this.mailerService.sendMail({
            to: emailId,
            template: "otp",
            context: { username, otp },
            from: smtpConfig.displayEmail,
            subject: "Email Verification",
            replyTo: smtpConfig.replyToEmail,
        });

        return { otpId };
    }

    public async findOtpValue(otpId: string): Promise<OtpStore> {
        return await this.otpModel.findById(otpId);
    }

    public async createUser(userData: RegisteredUserDTO): Promise<RegisteredUserDTO> {
        const userDocument = new this.userModel(userData);
        await userDocument.save();
        return userDocument;
    }

    public async checkUserUniquness(userData: UserDTO): Promise<boolean> {
        const userObj = await
            this
                .userModel
                .findOne({ $or: [{ email: userData.email }, { username: userData.username }] })
                .exec();

        return userObj ? false : true;
    }

    public async findUser(userData: LoggedInUserDTO): Promise<UserDTO> {
        const userObj = await
            this
                .userModel
                .findOne({
                    $or: [{ email: userData.cred }, { username: userData.cred }],
                    password: userData.password,
                })
                .exec();

        return userObj;
    }

    public async getGoogleCredentials(userData: GoogleAuthedUserDTO): Promise<UserDTO> {
        const userObj = await
            this
                .userModel
                .findOne({
                    $or: [{ email: userData.email }, { googleId: userData.googleId }],
                })
                .exec();

        return userObj;
    }

    public async createGoogleAuthedUser(userData: RegisteredGoogleAuthedUserDTO): Promise<UserDTO> {
        const userDocument = new this.userModel(userData);
        await userDocument.save();
        return userDocument;
    }

    public async checkUsernameAvailable(username: string): Promise<boolean> {
        const userObj = await this.userModel.findOne({ username });
        return userObj ? true : false;
    }

    public async getGoogleAuthedUserData(userData: GoogleAuthedUserDTO): Promise<UserDTO> {
        return await this.userModel.findOne({ email: userData.email, googleId: userData.googleId });
    }

    public async getUserDetails(userId: string): Promise<IUserDetails> {
        const details = await this
            .userModel
            .findById(
                userId,
                "name username bio website createdAt dateOfBirth location followers following picture backgroundImage"
            )
            .populate({
                path: "_id",
                model: "Post",
                justOne: false,
                localField: "_id",
                select: "_id text",
                foreignField: "user",
            })
            .exec();

        const clonedDetails = JSON.parse(JSON.stringify(details));
        if (clonedDetails) {
            clonedDetails["totalPosts"] = clonedDetails?.["_id"]?.length ?? 0;
            clonedDetails["_id"] = userId;
            return clonedDetails;
        } else {
            throw new CustomUnprocessableEntityException("The user details are unavailable.");
        }
    }

    public async getUserPosts(userId: string): Promise<Post[]> {
        return await this.postService.getUserPostDetails(userId);
    }

    public async getUserSavedPosts(userId: string): Promise<Post[]> {
        const savedPosts = await this.savesLikesService.getSavedPosts(userId);
        return savedPosts.map((postObj: ISavedPost) => postObj.post);
    }

    public async getComments(userId: string): Promise<Post[]> {
        const postList = await this.commentService.getUserComments(userId);
        return postList.map((postObj: IUserComment) => postObj.post);
    }

    public async updateDetails(userId: string, userData: IUpdateUserDetailsDTO): Promise<UserDTO> {
        const validationService = new CustomValidatorsService(validationParamList.updateDetails);
        const { isValid, errors } = validationService.validate(userData);
        if (!isValid && errors) throw new CustomBadRequestException(errors);

        const user = await this.userModel.findOne({ _id: userId });

        if (user.picture) this.commonService.unlinkImage(this.imageDirectory, user.picture);
        if (user.backgroundImage) this.commonService.unlinkImage(this.imageDirectory, user.backgroundImage);

        user.bio = userData?.bio ?? '';
        user.name = userData?.name ?? '';
        user.location = userData?.location ?? '';
        user.dateOfBirth = new Date(userData?.dateOfBirth);
        user.backgroundImage = userData?.backgroundImage ?? '';

        if (userData?.picture) user.picture = userData?.picture ?? '';
        if (userData?.website) user.website = userData?.website ?? '';

        return user.save();
    }

    public async deleteUserImage(userId: string, fileName: string, imageType: string): Promise<null> {
        await this.userModel.findByIdAndUpdate(userId, { [imageType]: '' });
        if (fileName) this.commonService.unlinkImage(this.imageDirectory, fileName);
        return null;
    }
}
