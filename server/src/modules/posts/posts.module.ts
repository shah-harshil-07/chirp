import * as moment from "moment";
import { MongooseModule } from "@nestjs/mongoose";
import { Module, forwardRef } from "@nestjs/common";

import { PostService } from "./posts.service";
import { PostController } from "./posts.controller";
import { ConfigService } from "src/modules/config/config.service";
import { CommentsModule } from "../reactions/comments/comments.module";
import { Post, PostSchema, ScheduledPost, ScheduledPostSchema } from "src/modules/posts/post.schema";

@Module({
	imports: [
		forwardRef(() => CommentsModule),
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
