import { Test, TestingModule } from '@nestjs/testing';
import { ExitMaterialsController } from './exit-materials.controller';
import { ExitMaterialsService } from './exit-materials.service';

describe('ExitMaterialsController', () => {
  let controller: ExitMaterialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExitMaterialsController],
      providers: [ExitMaterialsService],
    }).compile();

    controller = module.get<ExitMaterialsController>(ExitMaterialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
