import mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "SavesAndLikes" })
export class SavesAndLikes {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: "Post" })
    postId: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ default: false })
    liked: boolean;

    @Prop({ default: false })
    saved: boolean;
}

export const SavesAndLikesSchema = SchemaFactory.createForClass(SavesAndLikes);
