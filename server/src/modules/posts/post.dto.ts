import { MaxLength } from "class-validator";

export class PostDTO {
    @MaxLength(140)
    text: string;
}