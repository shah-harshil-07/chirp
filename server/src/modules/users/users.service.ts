import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { CommonService } from "../common/common.service";

@Injectable()
export class UsersService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly commonService: CommonService,
    ) { }

    public sendOtp(email_id: string, username: string): void {
        const otp = this.commonService.createFourDigitOtp();

        this
            .mailerService
            .sendMail({
                to: email_id,
                from: '"Chirp" <noreply@chirp.com>',
                replyTo: "shahharshil1998@gmail.com",
                subject: "Email Verification",
                template: "otp",
                context: { username, otp }
            })
            .then(response => {
                console.log(response);
            })
            .catch(err => {
                console.log(err);
            })
        ;
    }
}
