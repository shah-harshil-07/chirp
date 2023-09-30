import { Test, TestingModule } from '@nestjs/testing';
import { SavesAndLikesController } from './savesAndLikes.controller';

describe("SavesAndLikesController", () => {
  let controller: SavesAndLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavesAndLikesController],
    }).compile();

    controller = module.get<SavesAndLikesController>(SavesAndLikesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
