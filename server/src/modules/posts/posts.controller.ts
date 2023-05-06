import { PostService } from "./posts.service";
import { Post as UserPost } from "./post.schema";
import { PostDTO } from "./post.dto";
import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {
    Get,
    Put,
    Req,
    Body,
    Post,
    Param,
    Delete,
    UseGuards,
    Controller,
    UploadedFiles,
    ParseFilePipe,
    UseInterceptors,
    FileTypeValidator,
    MaxFileSizeValidator,
} from "@nestjs/common";

@Controller("posts")
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Get("all")
    async index(): Promise<UserPost[]> {
        return this.postService.findAll();
    }

    @Post("create")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(FilesInterceptor(
        "images[]",
        5,
        {
            storage: diskStorage({
                destination: "storage/post-images/",
                filename: (_, file, cb) => {
                    const extension = file?.originalname?.split('.')?.[1] ?? "jpg";
                    cb(null, `${Date.now()}.${extension}`);
                },
            })
        }
    ))
    async create(
        @Req() req: any,
        @Body() postData: PostDTO,
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                    new FileTypeValidator({ fileType: ".(jpg|jpeg|png)" }),
                ],
            })
        ) images: Array<Express.Multer.File>
    ): Promise<UserPost> {
        const { _id } = req.user;
        const fileNames = images.map(imageObj => imageObj.filename);
        const data = { ...postData, images: fileNames };
        return this.postService.create(data, _id);
    }

    @Put("update/:id")
    async update(@Body() postData: PostDTO, @Param() { id }: any): Promise<UserPost> {
        return this.postService.update(postData, id);
    }

    @Delete("delete/:id")
    async delete(@Param() { id }: any): Promise<any> {
        return this.postService.delete(id);
    }
}
