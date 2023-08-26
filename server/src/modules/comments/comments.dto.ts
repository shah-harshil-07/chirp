import { IsJSON, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CommentDTO {
    @IsJSON()
    data: string;
}