import { Body, Controller, Param, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import { LikesService } from "./likes.service";
import { IPostInfo, LikesDTO } from "./likes.dto";
import { ResponseInterceptor } from "src/interceptors/response";

@Controller("likes")
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Post("add/:postId")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async addLike(@Req() req: any, @Param() { postId }: LikesDTO): Promise<any> {
        const { _id: userId } = req.user;
        const data = { userId, postId };
        const likeData = await this.likesService.addLike(data);
        return { success: true, message: "Like added successfully!", data: likeData };
    }

    @Post("check-likes")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async checkLikes(@Req() req: any, @Body() postData: IPostInfo): Promise<any> {
        const { _id: userId } = req.user;
        const likeData = await this.likesService.checkLikes(userId, postData.postIds);
        return { success: true, message: "Likes checked successfully!", data: likeData };
    }
}
