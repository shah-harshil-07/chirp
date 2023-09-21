import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "Likes" })
export class Likes {
    @Prop({ required: true })
    postId: string;

    @Prop({ required: true })
    userId: string;
}

export const LikesSchema = SchemaFactory.createForClass(Likes);
