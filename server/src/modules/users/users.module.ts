import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { OtpStore, OtpStoreSchema } from "../common/otp-store.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel, UserSchema } from "./users.schema";
import { AuthService } from "../auth/auth.service";
import { AuthModule } from "../auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";

@Module({
	imports: [
		ConfigModule,
		AuthModule,
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
	providers: [UsersService, AuthService],
	exports: [UsersService],
})
export class UsersModule { }
