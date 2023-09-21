import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { PostService } from "./posts.service";
import { PostController } from "./posts.controller";
import { Post, PostSchema, ScheduledPost, ScheduledPostSchema } from "src/modules/posts/post.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Post.name, schema: PostSchema },
			{ name: ScheduledPost.name, schema: ScheduledPostSchema },
		]),
	],
	controllers: [PostController],
	providers: [PostService],
	exports: [PostService]
})
export class PostModule { }
