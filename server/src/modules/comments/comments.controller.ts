import { CommentDTO } from "./comments.dto";
import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Body, Controller, InternalServerErrorException, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";

import { CommentsService } from "./comments.service";
import { IResponseProps } from "src/interceptors/interfaces";
import { ResponseInterceptor } from "src/interceptors/response";
import { fileStorageConfigObj, parseFilePipeObj } from "../posts/file.config";

@Controller("comments")
export class CommentsController {
    constructor(private readonly commentService: CommentsService) { }

    @Post("store")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor, FilesInterceptor("images[]", 2, fileStorageConfigObj))
    async store(
        @Req() req: any,
        @Body() commentData: CommentDTO,
        @UploadedFiles(parseFilePipeObj) images: Array<Express.Multer.File>
    ): Promise<IResponseProps> {
        try {
            const createdAt = new Date();
            const { _id: userId } = req.user;
            const fileNames = images.map(imageObj => imageObj.filename);

            const parsedCommentData = JSON.parse(commentData.data);
            const { text, postId } = parsedCommentData;
            const parentCommentId = parsedCommentData?.parentCommentId ?? null;

            const data = { text, postId, parentCommentId, userId, createdAt, images: fileNames };
            const comment = await this.commentService.create(data);

            return { success: true, message: "Comment stored successfully!", data: comment };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
