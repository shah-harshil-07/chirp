import { join } from "path";
import { CronJob } from "cron";
import { AuthGuard } from "@nestjs/passport";
import { createReadStream, existsSync } from "fs";
import { SchedulerRegistry } from "@nestjs/schedule";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
    Get,
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
    UnprocessableEntityException,
} from "@nestjs/common";

import { PostService } from "./posts.service";
import { topupValidationStr } from "src/constants";
import { IResponseProps } from "src/interceptors/interfaces";
import { ResponseInterceptor } from "src/interceptors/response";
import { ConfigService } from "src/modules/config/config.service";
import { CommonService } from "src/modules/common/common.service";
import { CustomBadRequestException } from "src/exception-handlers/400/handler";
import { CustomValidatorsService } from "../custom-validators/custom-validators.service";
import { IScheduledPostIds, IVotingUserData, PostDTO, TopupParamProps } from "./post.dto";

@Controller("posts")
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly commonService: CommonService,
        private schedulerRegistery: SchedulerRegistry,
        private indexValidatorsService: CustomValidatorsService,
    ) {
        this.indexValidatorsService = new CustomValidatorsService({ topupCount: topupValidationStr });
    }

    @Get("all/:topupCount")
    @UseInterceptors(ResponseInterceptor)
    async index(@Param() paramData: TopupParamProps): Promise<IResponseProps> {
        const { isValid, errors } = this.indexValidatorsService.validate(paramData);
        if (!isValid) throw new CustomBadRequestException(errors);

        const posts = await this.postService.findAll(+paramData.topupCount);
        return { data: posts, success: true, message: "Received all the targetted posts successfully." };
    }

    @Get("scheduled/all")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async getScheduledPosts(@Req() req: any): Promise<IResponseProps> {
        const { _id: userId } = req.user;
        const data = await this.postService.getAllSchduledPosts(userId);
        return { data, success: true, message: "Received all the scheduled posts successfully." };
    }

    @Post("create")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor, FilesInterceptor("images[]", 5))
    async create(
        @Req() req: any,
        @Body() postData: PostDTO,
        @UploadedFiles(ConfigService.getParseFilePipeObj()) images: Array<Express.Multer.File>
    ): Promise<IResponseProps> {
        const { _id: userId } = req.user;
        const parsedData = JSON.parse(postData.data);
        const data = { text: parsedData.text, poll: parsedData.poll ?? null, images: [] };
        data["postId"] = parsedData.postId;

        data["images"] = await this.commonService.uploadMultipleImagesToS3(images);

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
    }

    @Post("poll/vote")
    @UseGuards(AuthGuard("jwt"))
    async votePoll(@Req() req: any, @Body() votingUserData: IVotingUserData): Promise<IResponseProps> {
        const { postId, choiceIndex, prevChoiceIndex } = votingUserData;
        const { _id: userId } = req.user;
        const post = await this.postService.votePoll(userId, postId, +choiceIndex, prevChoiceIndex);
        return { success: true, message: "Poll voted successfully.", data: post };
    }

    @Delete("scheduled/delete-many")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async deleteMultipleScheduledPosts(@Body() postData: IScheduledPostIds): Promise<IResponseProps> {
        const { postIds } = postData, deleteFn = this.postService.deleteScheduledPostWithImages;
        for (let i = 0; i < postIds.length; i++) deleteFn(Object(postIds[i]));
        return { success: true, message: "Scheduled posts deleted successfully." };
    }

    @Post("scheduled/reschedule/:id")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor, FilesInterceptor("images[]", 5))
    async reschedulePost(
        @Req() req: any,
        @Param() { id }: any,
        @Body() postData: PostDTO,
        @UploadedFiles(ConfigService.getParseFilePipeObj()) images: Array<Express.Multer.File>
    ): Promise<IResponseProps> {
        postData["images"] = await this.commonService.uploadMultipleImagesToS3(images);
        await this.postService.deleteScheduledPostWithImages(id);
        return await this.create(req, postData, images);
    }

    @Get("get-image/:filename")
    getScheduledPostImage(@Param() { filename }: any): StreamableFile {
        const path = join(process.cwd(), `storage/post-images/${filename}`);

        if (existsSync(path)) {
            const file = createReadStream(path, "base64");
            return new StreamableFile(file);
        }

        throw new UnprocessableEntityException();
    }
}
