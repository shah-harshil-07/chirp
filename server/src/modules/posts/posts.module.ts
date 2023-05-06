import { Module } from "@nestjs/common";
import { PostController } from "./posts.controller";
import { PostService } from "./posts.service";
import { Post, PostSchema } from "src/modules/posts/post.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
	],
	controllers: [PostController],
	providers: [PostService]
})
export class PostModule { }
