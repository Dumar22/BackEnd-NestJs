import { Test, TestingModule } from '@nestjs/testing';
import { ToolAsignamentController } from './tool-assignment.controller';
import { ToolAsignamentService } from './tool-assignment.service';

describe('ToolAsignamentController', () => {
  let controller: ToolAsignamentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToolAsignamentController],
      providers: [ToolAsignamentService],
    }).compile();

    controller = module.get<ToolAsignamentController>(ToolAsignamentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
