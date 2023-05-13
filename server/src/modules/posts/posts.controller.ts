import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { SchedulerRegistry } from "@nestjs/schedule";
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
    InternalServerErrorException,
} from "@nestjs/common";

import { ResponseInterceptor } from "src/interceptors/response";
import { IResponseProps } from "src/interceptors/interfaces";
import { PostService } from "./posts.service";
import { Post as UserPost } from "./post.schema";
import { PostDTO } from "./post.dto";

@Controller("posts")
export class PostController {
    constructor(private readonly postService: PostService, private schedulerRegistery: SchedulerRegistry) { }

    @Get("all")
    async index(): Promise<UserPost[]> {
        return this.postService.findAll();
    }

    @Post("create")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(
        ResponseInterceptor,
        FilesInterceptor(
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
        )
    )
    async create(
        @Req() req: any,
        @Body() postData: PostDTO,
        @UploadedFiles(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                    new FileTypeValidator({ fileType: ".(jpg|jpeg|png)" }),
                ],
            })
        ) images: Array<Express.Multer.File>
    ): Promise<IResponseProps> {
        try {
            const { _id } = req.user;
            const fileNames = images.map(imageObj => imageObj.filename);
            const parsedData = JSON.parse(postData.data);
            const data = { text: parsedData.text, images: fileNames, poll: parsedData.poll ?? null };

            if (parsedData?.["schedule"]) {
                const { year, month, dayOfMonth, hours, minutes } = parsedData["schedule"];
                const scheduledDate = new Date(year, month, dayOfMonth, hours, minutes, 0, 0);
                const scheduledMillis = scheduledDate.getTime(), currentMillis = Date.now();
                const diffMillis = scheduledMillis - currentMillis, timeoutName = `post-${Date.now()}`;
                const scheduleData = { data, timeoutId: timeoutName, postTiming: diffMillis, schedule: parsedData.schedule };

                const scheduledPost = await this.postService.schedulePost(scheduleData);

                if (scheduledPost && diffMillis > 0) {
                    const timeoutFn = setTimeout(() => {
                        this.postService.deleteScheduledPost(scheduledPost["_id"])
                        this.postService.create(data, _id);
                    }, diffMillis);
    
                    this.schedulerRegistery.addTimeout(timeoutName, timeoutFn);
                    return { success: true, message: "Post scheduled successfully." };
                } else {
                    return { success: false, message: "Something went wrong!" };
                }
            }

            const post = this.postService.create(data, _id);
            return { success: true, message: "Post created successfully.", data: post };
        } catch (err) {
            console.log(err);
            throw new InternalServerErrorException();
        }
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
