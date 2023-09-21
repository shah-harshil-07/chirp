import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "Comments" })
export class Comments {
    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    createdAt: Date;

    @Prop({ required: true })
    postId: string;

    @Prop({ default: null })
    parentCommentId: string | null;

    @Prop({ required: true })
    userId: string;

    @Prop()
    images: string[];
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);