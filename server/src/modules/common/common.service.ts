import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OtpStore } from "./otp-store.schema";
import { Model } from "mongoose";

@Injectable()
export class CommonService {
    constructor(@InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>) { }

    public async postOtp(otp: string): Promise<string> {
        const otpDocument = new this.otpModel({ otp, createdAt: Date.now() });

        try {
            await otpDocument.save();
            return otpDocument.id;
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
    }

    public createFourDigitOtp(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}
