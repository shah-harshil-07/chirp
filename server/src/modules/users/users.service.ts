import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { CommonService } from "../common/common.service";
import { OtpStore } from "../common/otp-store.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>,
        private readonly mailerService: MailerService,
        private readonly commonService: CommonService,
    ) { }

    public async sendOtp(emailId: string, username: string): Promise<{ otpId: string}> {
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
            throw new ExceptionsHandler();
        }
    }

    public async findOtpValue(otpId: string): Promise<OtpStore> {
        try {
            const optObj = await this.otpModel.findById(otpId);
            return optObj;
        } catch (err) {
            console.log(err);
            throw new ExceptionsHandler();
        }
    }
}
