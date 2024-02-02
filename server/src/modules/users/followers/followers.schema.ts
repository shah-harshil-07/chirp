import mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { UserModel } from "../users.schema";

@Schema({ collection: "Followers" })
export class FollowerModel {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true })
    following: UserModel;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true })
    follower: UserModel;
}

export const FollowerSchema = SchemaFactory.createForClass(FollowerModel);
