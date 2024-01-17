import { StorageEngine, diskStorage } from "multer";
import { FileTypeValidator, Injectable, MaxFileSizeValidator, ParseFilePipe } from "@nestjs/common";

interface IAnyObject {
    [key: string]: string;
}

interface IReactionConfigData {
    count: number;
    attribute: string | null;
}

interface IFileStorageConfig {
    storage: StorageEngine;
}

@Injectable()
export class ConfigService {
    private databaseConfig: IAnyObject = {
        port: process.env.PORT,
        connectionUrl: process.env.CONNECTION_URL,
        dbName: process.env.DB_NAME,
    };

    private smtpConfig: IAnyObject = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        senderEmail: process.env.SENDER_EMAIL_ADDRESS,
        displayEmail: process.env.FROM_EMAIL_ADDR,
        replyToEmail: process.env.REPLY_TO_EMAIL_ADDR,
    };

    private jwtConfig: IAnyObject = {
        secret: process.env.JWT_SECRET_KEY,
    };

    private loggingColorConfig: IAnyObject = {
        route: "yellow",
        error: "redBright",
        warning: "cyanBright",
        dependencies: "green",
    };

    public getConfigObj(key: string): IAnyObject {
        switch (key) {
            case "database":
                return this.databaseConfig;
            case "smtp":
                return this.smtpConfig;
            case "jwt":
                return this.jwtConfig;
            default:
                return null;
        }
    }

    public getLoggingColorConfig(): IAnyObject {
        return this.loggingColorConfig;
    }

    public getReactionConfig(reaction: string, mode: string): IReactionConfigData {
        let attribute = null;
        switch (reaction) {
            case "liked":
                attribute = "likes";
                break;
            case "saved":
                attribute = "saved";
                break;
            case "commented":
                attribute = "comments";
                break;
        }

        const count = mode === "add" ? 1 : mode === "remove" ? -1 : 0;
        return { attribute, count };
    }

    public static getFileStorageConfigObj(configKey = "post-images"): IFileStorageConfig {
        return {
            storage: diskStorage({
                destination: `storage/${configKey}/`,
                filename: (_, file, cb) => {
                    const extension = file?.originalname?.split('.')?.[1] ?? "jpg";
                    cb(null, `${Date.now()}.${extension}`);
                },
            })
        };
    };

    public static getParseFilePipeObj(sizeLimit = 5): ParseFilePipe {
        return new ParseFilePipe({
            fileIsRequired: false,
            validators: [
                new FileTypeValidator({ fileType: ".(jpg|jpeg|png)" }),
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * sizeLimit }),
            ],
        });
    }
}
