import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { SavesLikesService } from "./savesAndLikes.service";
import { PostModule } from "src/modules/posts/posts.module";
import { SavesAndLikes, SavesAndLikesSchema } from "./savesAndLikes.schema";
import { SavesAndLikesController } from "./savesAndLikes.controller";

@Module({
	imports: [
		PostModule,
		MongooseModule.forFeature([{ name: SavesAndLikes.name, schema: SavesAndLikesSchema }])
	],
	controllers: [SavesAndLikesController],
	providers: [SavesLikesService],
})
export class LikesModule { }
