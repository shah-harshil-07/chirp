import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "OtpStore" })
export class OtpStore {
    @Prop()
    otp: string;

    @Prop()
    createdAt: number;
}

export const OtpStoreSchema = SchemaFactory.createForClass(OtpStore);
