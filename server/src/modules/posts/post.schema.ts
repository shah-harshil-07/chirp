import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Date } from "mongoose";
import { UserModel } from "../users/users.schema";

class Duration {
    days: number;
    hours: number;
    minutes: number;
}

class Schedule {
    @Prop()
    userId: string;

    @Prop()
    year: number;

    @Prop()
    month: number;

    @Prop()
    dayOfMonth: number;

    @Prop()
    hours: number;

    @Prop()
    minutes: number;
}

interface IPollData {
    label: string;
    votes: number;
}

class Poll {
    @Prop()
    choices: IPollData[];

    @Prop()
    duration: Duration;
}

@Schema({ collection: "PostMessages" })
export class Post {
    @Prop({ required: true })
    text: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true })
    user: UserModel;

    @Prop()
    images: Array<string>;

    @Prop()
    poll: Poll;

    @Prop({ type: Date, required: true })
    createdAt: Date;
}

@Schema({ collection: "ScheduledMessages" })
export class ScheduledPost {
    @Prop()
    userId: string;

    @Prop()
    data: Post;

    @Prop()
    timeoutId: string;

    @Prop()
    schedule: Schedule;
}

export const PostSchema = SchemaFactory.createForClass(Post);
export const ScheduledPostSchema = SchemaFactory.createForClass(ScheduledPost);
