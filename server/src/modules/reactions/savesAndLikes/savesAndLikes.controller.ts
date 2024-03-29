import { AuthGuard } from "@nestjs/passport";
import { Body, Controller, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";

import { SavesLikesService } from "./savesAndLikes.service";
import { IPostInfo, SavesLikesDTO } from "./savesAndLikes.dto";
import { IResponseProps } from "src/interceptors/interfaces";
import { ResponseInterceptor } from "src/interceptors/response";

@Controller("saves-likes")
export class SavesAndLikesController {
    constructor(private readonly savesLikesService: SavesLikesService) { }

    @Post("add")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async addReaction(@Req() req: any, @Body() savesLikesReqData: SavesLikesDTO): Promise<IResponseProps> {
        const { _id: userId } = req.user;
        const { postId, reaction, postType } = savesLikesReqData;
        const data = { userId, postId, reaction, postType };
        const reationData = await this.savesLikesService.addReaction(data);
        return { success: true, message: `post ${reaction} successfully!`, data: reationData };
    }

    @Post("remove")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async removeReaction(@Req() req: any, @Body() savesLikesReqData: SavesLikesDTO): Promise<IResponseProps> {
        const { _id: userId } = req.user;
        const { postId, reaction, postType } = savesLikesReqData;
        const data = { userId, postId, reaction, postType };
        await this.savesLikesService.removeReaction(data);
        const attribute = reaction.slice(0, reaction.length - 1);
        return { success: true, message: `${attribute} removed successfully!` };
    }

    @Post("check")
    @UseGuards(AuthGuard("jwt"))
    @UseInterceptors(ResponseInterceptor)
    async checkReactions(@Req() req: any, @Body() postData: IPostInfo): Promise<IResponseProps> {
        const { _id: userId } = req.user;
        const reactionData = await this.savesLikesService.checkLikes(userId, postData.postIds);
        return { success: true, message: "Likes & saves checked successfully!", data: reactionData };
    }
}
