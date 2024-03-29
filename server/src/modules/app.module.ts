import { join } from "path";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { MailerModule } from "@nestjs-modules/mailer";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule as NestConfig } from "@nestjs/config";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

import { AuthModule } from "./auth/auth.module";
import { PostModule } from "./posts/posts.module";
import { UsersModule } from "./users/users.module";
import { CommonModule } from "./common/common.module";
import { ConfigModule } from "./config/config.module";
import { CommentsModule } from "./reactions/comments/comments.module";
import { LikesModule } from "./reactions/savesAndLikes/savesAndLikes.module";

@Module({
	imports: [
		PostModule,
		NestConfig.forRoot(),
		ScheduleModule.forRoot(),
		MongooseModule.forRoot(process.env.CONNECTION_URL, { dbName: process.env.DB_NAME }),
		MulterModule.register({ dest: "storage/post-images/" }),
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
		ConfigModule,
		LikesModule,
		CommentsModule,
	],
})
export class AppModule { }
