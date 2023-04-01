import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "PostMessages" })
export class Post {
    @Prop()
    title: String;

    @Prop()
    message: String;

    @Prop()
    creator: String;

    @Prop()
    tags: String[];

    @Prop()
    selectedFile: String;

    @Prop({ default: 0 })
    likes: Number;

    @Prop({ default: new Date() })
    createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);