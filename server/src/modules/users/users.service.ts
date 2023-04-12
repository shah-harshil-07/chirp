import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { CommonService } from "../common/common.service";
import { OtpStore } from "../common/otp-store.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { LoggedInUserDTO, RegisteredUserDTO, UserDTO } from "./users.dto";
import { UserModel } from "./users.schema";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>,
        @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>,
        private readonly mailerService: MailerService,
        private readonly commonService: CommonService,
    ) { }

    public async sendOtp(emailId: string, username: string): Promise<{ otpId: string }> {
        try {
            const otp = this.commonService.createFourDigitOtp();

            const otpId = await this.commonService.postOtp(otp);

            await this.mailerService.sendMail({
                to: emailId,
                from: process.env.FROM_EMAIL_ADDR,
                replyTo: process.env.REPLY_TO_EMAIL_ADDR,
                subject: "Email Verification",
                template: "otp",
                context: { username, otp }
            });

            return { otpId };
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    public async findOtpValue(otpId: string): Promise<OtpStore> {
        try {
            const optObj = await this.otpModel.findById(otpId);
            return optObj;
        } catch (err) {
            console.log(err);
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
                    .exec()
            ;

            return userObj ? false : true;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    public async login(userData: LoggedInUserDTO): Promise<boolean> {
        try {
            const userObj = this.findUser(userData);
            return userObj ? true : false;
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
}
