import { Optional } from "@nestjs/common";
import { IsJSON } from "class-validator";

export class PostDTO {
    @IsJSON()
    data: string;

    @Optional()
    images: string[]
}