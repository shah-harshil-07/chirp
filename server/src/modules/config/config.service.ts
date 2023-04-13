import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    private databaseConfig: any = {
        port: process.env.PORT,
        connectionUrl: process.env.CONNECTION_URL,
        dbName: process.env.DB_NAME,
    };

    private smtpConfig: any = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        senderEmail: process.env.SENDER_EMAIL_ADDRESS,
        displayEmail: process.env.FROM_EMAIL_ADDR,
        replyToEmail: process.env.REPLY_TO_EMAIL_ADDR,
    };

    private jwtConfig: any = {
        secret: process.env.JWT_SECRET_KEY,
    };

    public getConfigObj(key: string): any {
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
}
