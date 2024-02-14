import { Module } from "@nestjs/common";
import { CustomValidatorsService } from "./custom-validators.service";

@Module({
	providers: [
		CustomValidatorsService,
		{ provide: "validationObj", useValue: null }
	],
	exports: [
		CustomValidatorsService,
	]
})
export class CustomValidatorsModule { }
