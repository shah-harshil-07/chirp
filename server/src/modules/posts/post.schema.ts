import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

class IDuration {
    days: number;
    hours: number;
    minutes: number;
}

class Schedule {
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

class Poll {
    @Prop()
    choices: string[];

    @Prop()
    duration: IDuration[];
}

@Schema({ collection: "PostMessages" })
export class Post {
    @Prop()
    text: string;

    @Prop()
    userId: string;

    @Prop()
    images: Array<string>;

    @Prop()
    poll: Poll;

    @Prop()
    schedule: Schedule;
}

export const PostSchema = SchemaFactory.createForClass(Post);
