import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, UseInterceptors } from "@nestjs/common";

import { UserModel } from "./users.schema";
import { PostService } from "../posts/posts.service";
import { OtpStore } from "../common/otp-store.schema";
import { CommonService } from "../common/common.service";
import { ConfigService } from "../config/config.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { SavesLikesService } from "src/modules/reactions/savesAndLikes/savesAndLikes.service";
import {
    UserDTO,
    IUserDetails,
    LoggedInUserDTO,
    RegisteredUserDTO,
    GoogleAuthedUserDTO,
    RegisteredGoogleAuthedUserDTO,
} from "./users.dto";

@Injectable()
@UseInterceptors(ResponseInterceptor)
export class UsersService {
    constructor(
        private readonly postService: PostService,
        private readonly mailerService: MailerService,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
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
            from: smtpConfig.displayEmail,
            replyTo: smtpConfig.replyToEmail,
            subject: "Email Verification",
            template: "otp",
            context: { username, otp },
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
                .exec()
            ;

        return userObj;
    }

    public async getGoogleCredentials(userData: GoogleAuthedUserDTO): Promise<UserDTO> {
        const userObj = await
            this
                .userModel
                .findOne({
                    $or: [{ email: userData.email }, { googleId: userData.googleId }],
                })
                .exec()
            ;

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
        const postList = await this.postService.getUserPostDetails(userId);
        const userDetails = await this
            .userModel
            .findById(userId, "name username bio website createdAt dateOfBirth location followers following picture")
            .exec();

        return { posts: postList, userData: userDetails };
    }

    public async getUserSavedPosts(userId: string): Promise<any> {
        const data = await this.savesLikesService.getSavedPosts(userId);
        console.log(data);
        return data;
    }
}
