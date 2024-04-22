import { Model } from "mongoose";
import { existsSync, unlinkSync } from "fs";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
        const { bucketName, region } = this.s3Config ?? {};

        return this
            .s3Client
            .send(
                new PutObjectCommand({
                    Body: file,
                    Key: fileName,
                    ACL: "public-read",
                    ContentType: mimeType,
                    Bucket: this.s3Config.bucketName,
                })
            ).then(response => {
                if (response?.["$metadata"]?.["httpStatusCode"] === 200) {
                    return `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
                } else {
                    throw new CustomUnprocessableEntityException("Unable to upload image to the server.");
                }
            }).catch(err => {
                throw new CustomUnprocessableEntityException(err?.message ?? "Something went wrong!");
            });
    }

    public async uploadMultipleImagesToS3(images: Array<Express.Multer.File>): Promise<string[]> {
        const imgUploadPromises = [];
        for (const image of images) {
            const { buffer, mimetype, originalname } = image;
            const ext = originalname?.split('.')?.[1] ?? "jpg";
            const imageName = `${Date.now()}-${(Math.random() * (10 ** 9)).toFixed(0)}.${ext}`;
            imgUploadPromises.push(this.uploadImageToS3(imageName, buffer, mimetype));
        }

        return imgUploadPromises.length > 0 ? Promise.all(imgUploadPromises) : [];
    }

    public async deleteImageFromS3(fileName: string): Promise<boolean> {
        const { bucketName } = this.s3Config ?? {};

        return this
            .s3Client
            .send(new DeleteObjectCommand({ Bucket: bucketName, Key: fileName }))
            .then(response => {
                return response?.["$metadata"]?.["httpStatusCode"] === 204;
            })
            .catch(err => {
                throw new CustomUnprocessableEntityException(err?.message ?? "Something went wrong!");
            });
    }

    public async deleteMultipleImagesFromS3(fileNames: string[]): Promise<boolean> {
        const { bucketName } = this.s3Config ?? {};

        return this
            .s3Client
            .send(
                new DeleteObjectsCommand({
                    Bucket: bucketName,
                    Delete: { Quiet: false, Objects: fileNames.map(Key => { return { Key }; }) },
                })
            )
            .then(response => {
                return response.Deleted.length === fileNames.length;
            })
            .catch(err => {
                throw new CustomUnprocessableEntityException(err?.message ?? "Something went wrong!");
            });
    }
}
