import { Model } from "mongoose";
import { existsSync, unlinkSync } from "fs";
import { InjectModel } from "@nestjs/mongoose";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { OtpStore } from "./otp-store.schema";
import { topupIncrementalValue } from "src/constants";
import { ConfigService, IS3ClientConfig } from "src/modules/config/config.service";
import { CustomUnprocessableEntityException } from "src/exception-handlers/422/handler";

@Injectable()
export class CommonService {
    private s3Client: S3Client;
    private s3Config: IS3ClientConfig;

    constructor(
        private readonly configService: ConfigService,
        @InjectModel(OtpStore.name) private readonly otpModel: Model<OtpStore>,
    ) {
        this.s3Config = this.configService.getS3ClientConfigObj();

        this.s3Client = new S3Client({
            region: this.s3Config.region,
            credentials: {
                accessKeyId: this.s3Config.accessKeyId,
                secretAccessKey: this.s3Config.secretAccessKey
            },
        });
    }

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

    public unlinkImage(dir: string, fileName: string): void {
        const path = `${dir}/${fileName}`;
        if (existsSync(path)) unlinkSync(path);
    }

    public getTopupRange(topupCount: number): number[] {
        const diff = topupCount - topupIncrementalValue;
        const startCount = diff <= 0 ? 0 : diff;
        const endCount = Math.min(topupCount, topupIncrementalValue);
        return [startCount, endCount];
    }

    public async uploadImageToS3(fileName: string, file: Buffer, mimeType: string): Promise<string> {
        const response = await this.s3Client.send(
            new PutObjectCommand({
                Body: file,
                Key: fileName,
                ACL: "public-read",
                ContentType: mimeType,
                Bucket: this.s3Config.bucketName,
            })
        );

        if (response["$metadata"]["httpStatusCode"] === 200) {
            const { bucketName, region } = this.s3Config ?? {};
            return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
        } else {
            throw new CustomUnprocessableEntityException("Unable to upload image to the server.");
        }
    }
}
