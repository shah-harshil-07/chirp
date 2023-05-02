import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "PostMessages" })
export class Post {
    @Prop()
    text: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);