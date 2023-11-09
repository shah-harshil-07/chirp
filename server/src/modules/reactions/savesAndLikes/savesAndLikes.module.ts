import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { SavesLikesService } from "./savesAndLikes.service";
import { PostModule } from "src/modules/posts/posts.module";
import { SavesAndLikesController } from "./savesAndLikes.controller";
import { SavesAndLikes, SavesAndLikesSchema } from "./savesAndLikes.schema";
import { CommentsModule } from "src/modules/reactions/comments/comments.module";

@Module({
	imports: [
		PostModule,
		CommentsModule,
		MongooseModule.forFeature([{ name: SavesAndLikes.name, schema: SavesAndLikesSchema }])
	],
	controllers: [SavesAndLikesController],
	providers: [SavesLikesService],
})
export class LikesModule { }
