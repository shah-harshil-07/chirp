import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { UserModel } from "./users.schema";
import { OtpStore } from "../common/otp-store.schema";
import { CommonService } from "../common/common.service";
import { ConfigService } from "../config/config.service";
import { GoogleAuthedUserDTO, LoggedInUserDTO, RegisteredGoogleAuthedUserDTO, RegisteredUserDTO, UserDTO } from "./users.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>,
        @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
        private readonly mailerService: MailerService,
        private readonly commonService: CommonService,
        private readonly configService: ConfigService,
    ) { }

    public async sendOtp(emailId: string, username: string): Promise<{ otpId: string }> {
        try {
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
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async findOtpValue(otpId: string): Promise<OtpStore> {
        try {
            const optObj = await this.otpModel.findById(otpId);
            return optObj;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async createUser(userData: RegisteredUserDTO): Promise<RegisteredUserDTO> {
        const userDocument = new this.userModel(userData);

        try {
            await userDocument.save();
            return userDocument;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async checkUserUniquness(userData: UserDTO): Promise<boolean> {
        try {
            const userObj = await
                this
                    .userModel
                    .findOne({ $or: [{ email: userData.email }, { username: userData.username }] })
                    .exec();

            return userObj ? false : true;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async findUser(userData: LoggedInUserDTO): Promise<UserDTO> {
        try {
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
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async getGoogleCredentials(userData: GoogleAuthedUserDTO): Promise<UserDTO> {
        try {
            const userObj = await
                this
                    .userModel
                    .findOne({
                        $or: [{ email: userData.email }, { googleId: userData.googleId }],
                    })
                    .exec()
                ;

            return userObj;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async createGoogleAuthedUser(userData: RegisteredGoogleAuthedUserDTO): Promise<UserDTO> {
        const userDocument = new this.userModel(userData);

        try {
            await userDocument.save();
            return userDocument;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async checkUsernameAvailable(username: string): Promise<boolean> {
        try {
            const userObj = await this.userModel.findOne({ username });
            return userObj ? true : false;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async getGoogleAuthedUserData(userData: GoogleAuthedUserDTO): Promise<UserDTO> {
        try {
            return await this.userModel.findOne({ email: userData.email, googleId: userData.googleId });
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
