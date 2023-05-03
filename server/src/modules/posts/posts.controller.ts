import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { PostService } from "./posts.service";
import { Post as UserPost } from "./post.schema";
import { PostDTO } from "./post.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("posts")
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Get("all")
    async index(): Promise<UserPost[]> {
        return this.postService.findAll();
    }

    @UseGuards(AuthGuard("jwt"))
    @Post("create")
    async create(@Req() req: any, @Body() postData: PostDTO): Promise<UserPost> {
        const { _id } = req.user;
        return this.postService.create(postData, _id);
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
