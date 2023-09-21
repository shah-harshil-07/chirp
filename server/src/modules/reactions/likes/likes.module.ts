import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { LikesService } from "./likes.service";
import { Likes, LikesSchema } from "./likes.schema";
import { LikesController } from "./likes.controller";
import { PostModule } from "src/modules/posts/posts.module";

@Module({
	imports: [
		PostModule,
		MongooseModule.forFeature([{ name: Likes.name, schema: LikesSchema }])
	],
	controllers: [LikesController],
	providers: [LikesService],
})
export class LikesModule { }
