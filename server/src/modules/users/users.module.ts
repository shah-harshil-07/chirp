import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { OtpStore, OtpStoreSchema } from "../common/otp-store.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: OtpStore.name, schema: OtpStoreSchema }])
	],
	controllers: [UsersController],
	providers: [UsersService]
})
export class UsersModule { }
