import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { PostModule } from "src/modules/posts/posts.module";
import { Comments, CommentsSchema } from "./comments.schema";
import { ConfigModule } from "src/modules/config/config.module";
import { ConfigService } from "src/modules/config/config.service";
import { CustomValidatorsModule } from "../../custom-validators/custom-validators.module";

@Module({
	imports: [
		PostModule,
		ConfigModule,
		CustomValidatorsModule,
		MongooseModule.forFeature([
			{ name: Comments.name, schema: CommentsSchema }
		]),
	],
	controllers: [CommentsController],
	providers: [CommentsService, CustomValidatorsModule, ConfigService]
})
export class CommentsModule { }
