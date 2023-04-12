import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { OtpStore, OtpStoreSchema } from "../common/otp-store.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModel, UserSchema } from "./users.schema";
import { DummyUsersService } from "./dummy-users.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: OtpStore.name, schema: OtpStoreSchema },
			{ name: UserModel.name, schema: UserSchema },
		])
	],
	controllers: [UsersController],
	providers: [UsersService, DummyUsersService],
	exports: [UsersService, DummyUsersService],
})
export class UsersModule { }
