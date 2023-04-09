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
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
