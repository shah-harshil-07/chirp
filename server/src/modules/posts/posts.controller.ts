import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";
import { SchedulerRegistry } from "@nestjs/schedule";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { CronJob } from "cron";
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
    StreamableFile,
    UseInterceptors,
    InternalServerErrorException,
    UnprocessableEntityException,
} from "@nestjs/common";

import { ResponseInterceptor } from "src/interceptors/response";
import { IResponseProps } from "src/interceptors/interfaces";
import { PostService } from "./posts.service";
import { Post as UserPost } from "./post.schema";
import { IScheduledPostIds, IVotingUserData, PostDTO } from "./post.dto";
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
    async getScheduledPosts(@Req() req: any): Promise<IResponseProps> {
        const { _id: userId } = req.user;

        try {
            const data = await this.postService.getAllSchduledPosts(userId);
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
            const { _id: userId } = req.user;
            const fileNames = images.map(imageObj => imageObj.filename);
            const parsedData = JSON.parse(postData.data);
            const data = { text: parsedData.text, images: fileNames, poll: parsedData.poll ?? null };

            if (data?.poll?.choices?.length) {
                const choices = data.poll.choices.map((choice: string) => {
                    return { label: choice, votes: 0 };
                });

                data.poll.choices = choices;
                data.poll.users = [];
            }

            if (parsedData?.["schedule"]) {
                const { year, month, dayOfMonth, hours, minutes } = parsedData["schedule"];
                const scheduledDate = new Date(year, month, dayOfMonth, hours, minutes, 0, 0);
                const timeoutName = `post-${Date.now()}`, diffMillis = scheduledDate.getTime() - Date.now();
                const scheduleData = { data, timeoutId: timeoutName, schedule: parsedData.schedule };

                const scheduledPost = await this.postService.schedulePost(scheduleData, userId);

                if (scheduledPost && diffMillis > 0) {
                    const job = new CronJob(scheduledDate, () => {
                        this.postService.deleteScheduledPost(scheduledPost["_id"]);
                        this.postService.create(data, userId);
                    });

                    this.schedulerRegistery.addCronJob(timeoutName, job);
                    job.start();

                    return { success: true, message: "Post scheduled successfully." };
                } else {
                    return { success: false, message: "You cannot schedule a post to send it to past." };
                }
            }

            const post = await this.postService.create(data, userId);
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

    @Post("poll/vote")
    @UseGuards(AuthGuard("jwt"))
    async votePoll(@Req() req: any, @Body() votingUserData: IVotingUserData) {
        const { postId, choiceIndex } = votingUserData;
        const { _id: userId } = req.user;
        return this.postService.votePoll(userId, postId, choiceIndex);
    }

    @Delete("scheduled/delete-many")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async deleteMultipleScheduledPosts(@Body() postData: IScheduledPostIds): Promise<IResponseProps> {
        try {
            const { postIds } = postData, deleteFn = this.postService.deleteScheduledPostWithImages;
            for (let i = 0; i < postIds.length; i++) deleteFn(Object(postIds[i]));
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
            await this.postService.deleteScheduledPostWithImages(id);
            return await this.create(req, postData, images);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException();
        }
    }

    @Get("scheduled/get-image/:filename")
    getScheduledPostImage(@Param() { filename }: any): StreamableFile {
        const path = join(process.cwd(), `storage/post-images/${filename}`);

        if (existsSync(path)) {
            const file = createReadStream(path, "base64");
            return new StreamableFile(file);
        }

        throw new UnprocessableEntityException();
    }
}
