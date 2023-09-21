import { Controller, Param, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";

import { LikesDTO } from "./likes.dto";
import { LikesService } from "./likes.service";
import { ResponseInterceptor } from "src/interceptors/response";
import { AuthGuard } from "@nestjs/passport";

@Controller("likes")
export class LikesController {
    constructor(private readonly likesService: LikesService) { }

    @Post("add/:postId")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async addLike(@Req() req: any, @Param() { postId }: LikesDTO): Promise<any> {
        console.log(req);
        const { _id: userId } = req.user;
        const data = { userId, postId };
        const likeData = await this.likesService.addLike(data);
        return { success: true, message: "Like added successfully!", data: likeData };
    }
}
