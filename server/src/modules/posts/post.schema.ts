import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "PostMessages" })
export class Post {
    @Prop()
    text: string;

    @Prop()
    userId: string;

    @Prop()
    images: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);