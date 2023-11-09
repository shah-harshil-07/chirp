import * as moment from "moment";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { PostService } from "./posts.service";
import { PostController } from "./posts.controller";
import { ConfigModule } from "src/modules/config/config.module";
import { ConfigService } from "src/modules/config/config.service";
import { Post, PostSchema, ScheduledPost, ScheduledPostSchema } from "src/modules/posts/post.schema";

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([
			{ name: Post.name, schema: PostSchema },
			{ name: ScheduledPost.name, schema: ScheduledPostSchema },
		]),
	],
	controllers: [PostController],
	providers: [
		PostService,
		ConfigService,
		{ provide: "Moment", useValue: moment },
	],
	exports: [PostService]
})
export class PostModule { }
