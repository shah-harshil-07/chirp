import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { OtpStore, OtpStoreSchema } from "../common/otp-store.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel, UserSchema } from "./users.schema";
import { AuthService } from "../auth/auth.service";
import { AuthModule } from "../auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "../auth/constants";

@Module({
	imports: [
		JwtModule.register({ secret: jwtConstants.secret }),
		AuthModule,
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
