import { Module } from "@nestjs/common";
import { PostModule } from "./posts/posts.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from "path";
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		PostModule,
		ConfigModule.forRoot(),
		MongooseModule.forRoot(process.env.CONNECTION_URL, { dbName: process.env.DB_NAME }),
		MailerModule.forRoot({
			transport: {
				host: process.env.SMTP_HOST,
				secure: false,
				port: process.env.SMTP_PORT,
				auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
			},
			template: {
				dir: join("src", "views"),
				adapter: new HandlebarsAdapter(),
				options: { strict: true },
			}
		}),
		UsersModule,
		CommonModule,
		AuthModule,
	],
})
export class AppModule { }
