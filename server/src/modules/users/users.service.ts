import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { CommonService } from "../common/common.service";
import { OtpStore } from "../common/otp-store.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>,
        private readonly mailerService: MailerService,
        private readonly commonService: CommonService,
    ) { }

    public async sendOtp(email_id: string, username: string): Promise<string | null> {
        try {
            const otpObj = await this.commonService.createFourDigitOtp();

            if (otpObj?.otp) {
                try {
                    await this.mailerService.sendMail({
                        to: email_id,
                        from: '"Chirp" <noreply@chirp.com>',
                        replyTo: "shahharshil1998@gmail.com",
                        subject: "Email Verification",
                        template: "otp",
                        context: { username, otp: otpObj?.otp }
                    });

                    return otpObj.id;
                } catch (err) {
                    return null;
                }
            }
        } catch(err) {
            return null;
        }
    }

    public async findOtpValue(otp_id: string): Promise<OtpStore> {
        try {
            const optObj = await this.otpModel.findById(otp_id);
            return optObj;
        } catch (error) {
            return null;
        }
    }
}
