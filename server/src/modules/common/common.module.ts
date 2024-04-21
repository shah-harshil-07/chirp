import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CommonService } from "./common.service";
import { ConfigService } from "../config/config.service";
import { OtpStore, OtpStoreSchema } from "./otp-store.schema";

@Global()
@Module({
	imports: [
		MongooseModule.forFeature([{ name: OtpStore.name, schema: OtpStoreSchema }])
	],
	providers: [CommonService, ConfigService],
	exports: [CommonService]
})
export class CommonModule { }
