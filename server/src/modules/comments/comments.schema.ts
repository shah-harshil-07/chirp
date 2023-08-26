import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Comments {
    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    createdAt: Date;

    @Prop({ required: true })
    postId: string;

    @Prop({ required: true })
    parentCommentId: string | null;

    @Prop({ required: true })
    userId: string;

    @Prop()
    images: string[];
}