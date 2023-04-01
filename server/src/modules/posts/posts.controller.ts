import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { PostService } from "./posts.service";
import { Post as UserPost } from "./post.schema";
import { PostDTO } from "./post.dto";

@Controller("posts")
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Get("all")
    async index(): Promise<UserPost[]> {
        return this.postService.findAll();
    }

    @Post("create")
    async create(@Body() postDTO: PostDTO): Promise<UserPost> {
        return this.postService.create(postDTO);
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
