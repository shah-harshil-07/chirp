import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";

import { UsersService } from "./users.service";
import { AuthModule } from "../auth/auth.module";
import { PostModule } from "../posts/posts.module";
import { UsersController } from "./users.controller";
import { UserModel, UserSchema } from "./users.schema";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";
import { OtpStore, OtpStoreSchema } from "../common/otp-store.schema";
import { CommentsModule } from "../reactions/comments/comments.module";
import { LikesModule } from "../reactions/savesAndLikes/savesAndLikes.module";
import { CustomValidatorsModule } from "../custom-validators/custom-validators.module";

@Module({
	imports: [
		ConfigModule,
		AuthModule,
		PostModule,
		LikesModule,
		CommentsModule,
		CustomValidatorsModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.getConfigObj("jwt").secret
			}),
		}),
		MongooseModule.forFeature([
			{ name: OtpStore.name, schema: OtpStoreSchema },
			{ name: UserModel.name, schema: UserSchema },
		]),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule { }
