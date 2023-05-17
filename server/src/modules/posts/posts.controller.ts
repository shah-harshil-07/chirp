import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
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
    UseInterceptors,
    InternalServerErrorException,
} from "@nestjs/common";

import { ResponseInterceptor } from "src/interceptors/response";
import { IResponseProps } from "src/interceptors/interfaces";
import { PostService } from "./posts.service";
import { Post as UserPost } from "./post.schema";
import { IScheduledPostIds, PostDTO } from "./post.dto";
import { fileStorageConfigObj, parseFilePipeObj } from "./file.config";

@Controller("posts")
export class PostController {
    constructor(private readonly postService: PostService, private schedulerRegistery: SchedulerRegistry) { }

    @Get("all")
    async index(): Promise<UserPost[]> {
        return this.postService.findAll();
    }

    @Get("scheduled/all")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async getScheduledPosts(): Promise<IResponseProps> {
        try {
            const data = await this.postService.getAllSchduledPosts();
            return { data, success: true, message: "Received all the scheduled posts successfully." };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("create")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor, FilesInterceptor("images[]", 5, fileStorageConfigObj))
    async create(
        @Req() req: any,
        @Body() postData: PostDTO,
        @UploadedFiles(parseFilePipeObj) images: Array<Express.Multer.File>
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
                        this.postService.deleteScheduledPost(scheduledPost["_id"]);
                        this.postService.create(data, _id);
                    }, diffMillis);

                    this.schedulerRegistery.addTimeout(timeoutName, timeoutFn);
                    return { success: true, message: "Post scheduled successfully." };
                } else {
                    return { success: false, message: "Something went wrong!" };
                }
            }

            const post = await this.postService.create(data, _id);
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

    @Delete("scheduled/delete/:id")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async deleteScheduledPost(@Param() { id }: any): Promise<IResponseProps> {
        try {
            const post = await this.postService.deleteScheduledPostWithImages(id);
            const timeoutAvailable = this.schedulerRegistery.getTimeout(post.timeoutId);
            if (timeoutAvailable) this.schedulerRegistery.deleteTimeout(post.timeoutId);
            return { success: true, message: "Scheduled post deleted successfully." };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Delete("scheduled/delete-many")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async deleteMultipleScheduledPosts(@Body() postData: IScheduledPostIds): Promise<IResponseProps> {
        try {
            const { postIds } = postData;
            for (let i = 0; i < postIds.length; i++) this.deleteScheduledPost({ id:  postIds[i] });
            return { success: true, message: "Scheduled posts deleted successfully." };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Post("scheduled/reschedule/:id")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor, FilesInterceptor("images[]", 5, fileStorageConfigObj))
    async reschedulePost(
        @Req() req: any,
        @Param() { id }: any,
        @Body() postData: PostDTO,
        @UploadedFiles(parseFilePipeObj) images: Array<Express.Multer.File>
    ): Promise<IResponseProps> {
        try {
            const post = await this.postService.deleteScheduledPostWithImages(id);
            this.schedulerRegistery.deleteTimeout(post.timeoutId);
            const newPostResponse = await this.create(req, postData, images);
            return newPostResponse;
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }
}
