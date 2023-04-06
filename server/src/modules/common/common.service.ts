import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OtpStore } from "./otp-store.schema";
import { Model } from "mongoose";

interface IOtp {
    id: string;
    otp: string;
}

@Injectable()
export class CommonService {
    constructor(@InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>) { }

    private async postOtp(otp: string): Promise<string | null> {
        const otpDocument = new this.otpModel({ otp });

        try {
            await otpDocument.save();
            return otpDocument.id;
        } catch (err) {
            return null;
        }
    }

    public async createFourDigitOtp(): Promise<IOtp | null> {
        const num = ((+(Math.random().toFixed(4))) * 10000).toString();

        try {
            const otp_id = await this.postOtp(num);
            return { id: otp_id, otp: num };
        } catch (err) {
            return null;
        }
    }
}
