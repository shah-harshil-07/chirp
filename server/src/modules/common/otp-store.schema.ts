import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ collection: "OtpStore" })
export class OtpStore {
    @Prop()
    otp: string;

    @Prop({ default: new Date() })
    createdAt: Date;
}

export const OtpStoreSchema = SchemaFactory.createForClass(OtpStore);
