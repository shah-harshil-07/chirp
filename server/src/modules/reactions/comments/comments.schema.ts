import mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Post } from "src/modules/posts/post.schema";

@Schema({ collection: "Comments" })
export class Comments {
    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    createdAt: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true })
    postId: Post;

    @Prop({ default: null })
    parentCommentId: string | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true })
    userId: string;

    @Prop()
    images: string[];

    @Prop({ default: 0 })
    comments: number;

    @Prop({ default: 0 })
    likes: number;

    @Prop({ default: 0 })
    saved: number;

    @Prop({ default: 0 })
    views: 0;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
