import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "Users" })
export class UserModel {
    @Prop()
    name: string;

    @Prop()
    username: string;

    @Prop()
    email: string;

    @Prop()
    bio: string;

    @Prop()
    website: string;

    @Prop({ default: null })
    dateOfBirth: Date;

    @Prop()
    location: string;

    @Prop({ default: 0 })
    followers: number;

    @Prop({ default: 0 })
    following: number;

    @Prop()
    password: string;

    @Prop()
    googleId: string;

    @Prop()
    picture: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
