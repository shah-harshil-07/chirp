import { IsJSON } from "class-validator";

export class PostDTO {
    @IsJSON()
    data: string;

    images: string[]
}