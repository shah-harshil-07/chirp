import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { CommentsController } from "./comments.controller";
import { CommentsService } from "./comments.service";
import { Comments, CommentsSchema } from "./comments.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Comments.name, schema: CommentsSchema }
		])
	],
	controllers: [CommentsController],
	providers: [CommentsService]
})
export class CommentsModule { }
