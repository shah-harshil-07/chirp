import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Body, Controller, Param, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";

import { CommentsService } from "./comments.service";
import { IResponseProps } from "src/interceptors/interfaces";
import { ResponseInterceptor } from "src/interceptors/response";
import { ConfigService } from "src/modules/config/config.service";
import { CustomBadRequestException } from "src/exception-handlers/400/handler";
import { CommentDTO, ICommentListReqDTO, IPostId, validationParamList } from "./comments.dto";
import { CustomValidatorsService } from "src/modules/custom-validators/custom-validators.service";

@Controller("comments")
export class CommentsController {
    constructor(
        private readonly commentService: CommentsService,
        private readonly storeValidatorsService: CustomValidatorsService,
    ) {
        this.storeValidatorsService = new CustomValidatorsService(validationParamList.store.commentData);
    }

    @Post("store")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor, FilesInterceptor("images[]", 4, ConfigService.getFileStorageConfigObj()))
    async store(
        @Req() req: any,
        @Body() commentData: CommentDTO,
        @UploadedFiles(ConfigService.getParseFilePipeObj()) images: Array<Express.Multer.File>
    ): Promise<IResponseProps> {
        const createdAt = new Date();
        const { _id: userId } = req.user;
        const fileNames = images.map(imageObj => imageObj.filename);

        const parsedCommentData = JSON.parse(commentData.data);
        const { isValid, errors } = this.storeValidatorsService.validate(parsedCommentData);

        if (!isValid) throw new CustomBadRequestException(errors);

        const { text, postId } = parsedCommentData;
        const parentCommentId = parsedCommentData?.parentCommentId ?? null;

        const data = { text, postId, parentCommentId, userId, createdAt, images: fileNames };
        const comment = await this.commentService.create(data);

        return { success: true, message: "Comment stored successfully!", data: comment };
    }

    @Post("all/:postId")
    @UseInterceptors(ResponseInterceptor)
    async list(@Param() { postId }: IPostId, @Body() commentListReq: ICommentListReqDTO): Promise<IResponseProps> {
        const commentList = await this.commentService.list(postId, commentListReq.type);
        return { success: true, message: "Comment list fetched successfully.", data: commentList };
    }
}
