import { Injectable } from "@nestjs/common";

interface IAnyObject {
    [key: string]: string;
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
}
