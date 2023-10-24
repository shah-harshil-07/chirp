import { Global, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpStore, OtpStoreSchema } from './otp-store.schema';

@Global()
@Module({
	imports: [
		MongooseModule.forFeature([{ name: OtpStore.name, schema: OtpStoreSchema }])
	],
	providers: [CommonService],
	exports: [CommonService]
})
export class CommonModule { }
