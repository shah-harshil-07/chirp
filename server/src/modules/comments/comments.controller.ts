import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CommentDTO, validationParamList } from "./comments.dto";
import { Body, Controller, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";

import { CommentsService } from "./comments.service";
import { IResponseProps } from "src/interceptors/interfaces";
import { ResponseInterceptor } from "src/interceptors/response";
import { fileStorageConfigObj, parseFilePipeObj } from "../posts/file.config";
import { CustomBadRequestException } from "src/exception-handlers/400/handler";
import { CustomValidatorsService } from "../custom-validators/custom-validators.service";

@Controller("comments")
export class CommentsController {
    constructor(private readonly commentService: CommentsService) { }

    @Post("store")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor, FilesInterceptor("images[]", 4, fileStorageConfigObj))
    async store(
        @Req() req: any,
        @Body() commentData: CommentDTO,
        @UploadedFiles(parseFilePipeObj) images: Array<Express.Multer.File>
    ): Promise<IResponseProps> {
        const createdAt = new Date();
        const { _id: userId } = req.user;
        const fileNames = images.map(imageObj => imageObj.filename);

        const parsedCommentData = JSON.parse(commentData.data);
        const validationObj = new CustomValidatorsService(validationParamList.store.commentData);
        const { isValid, errors } = validationObj.validate(parsedCommentData);

        if (!isValid) throw new CustomBadRequestException(errors);

        const { text, postId } = parsedCommentData;
        const parentCommentId = parsedCommentData?.parentCommentId ?? null;

        const data = { text, postId, parentCommentId, userId, createdAt, images: fileNames };
        const comment = await this.commentService.create(data);

        return { success: true, message: "Comment stored successfully!", data: comment };
    }
}