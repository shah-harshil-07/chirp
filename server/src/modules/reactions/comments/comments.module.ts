import { MongooseModule } from "@nestjs/mongoose";
import { Module, forwardRef } from "@nestjs/common";

import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { PostModule } from "src/modules/posts/posts.module";
import { Comments, CommentsSchema } from "./comments.schema";
import { ConfigModule } from "src/modules/config/config.module";
import { CustomValidatorsModule } from "src/modules/custom-validators/custom-validators.module";

@Module({
	imports: [
		ConfigModule,
		CustomValidatorsModule,
		forwardRef(() => PostModule),
		MongooseModule.forFeature([
			{ name: Comments.name, schema: CommentsSchema }
		]),
	],
	controllers: [CommentsController],
	providers: [CommentsService],
	exports: [CommentsService],
})
export class CommentsModule { }
