import { Test, TestingModule } from "@nestjs/testing";
import { PostController } from "./posts.controller";
import { PostService } from "./posts.service";
import { Model } from "mongoose";
import { Post } from "./post.schema";

describe("PostController", () => {
	let postController: PostController, postService: PostService, postModel: Model<Post>;

	beforeEach(async () => {
		postService = new PostService(postModel);
		postController = new PostController(postService);
	});

	describe("index", () => {
		it("should return array of posts", async () => {
			const result = [];
			jest.spyOn(postService, "findAll").mockImplementation(async () => result);
			expect(await postController.index()).toBe(result);
		})
	});
});
