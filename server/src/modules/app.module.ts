import { Module } from "@nestjs/common";
import { PostModule } from "./posts/posts.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";

@Module({
	imports: [
		PostModule,
		ConfigModule.forRoot(),
		MongooseModule.forRoot(process.env.CONNECTION_URL, { dbName: process.env.DB_NAME }),
	],
})
export class AppModule { }
