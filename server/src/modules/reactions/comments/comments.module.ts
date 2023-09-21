import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { Comments, CommentsSchema } from "./comments.schema";
import { CustomValidatorsModule } from "../../custom-validators/custom-validators.module";

@Module({
	imports: [
		CustomValidatorsModule,
		MongooseModule.forFeature([
			{ name: Comments.name, schema: CommentsSchema }
		])
	],
	controllers: [CommentsController],
	providers: [CommentsService, CustomValidatorsModule]
})
export class CommentsModule { }
