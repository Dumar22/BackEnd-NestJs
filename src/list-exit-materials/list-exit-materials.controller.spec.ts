import { Test, TestingModule } from '@nestjs/testing';
import { ListExitMaterialsController } from './list-exit-materials.controller';
import { ListExitMaterialsService } from './list-exit-materials.service';

describe('ListExitMaterialsController', () => {
  let controller: ListExitMaterialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListExitMaterialsController],
      providers: [ListExitMaterialsService],
    }).compile();

    controller = module.get<ListExitMaterialsController>(ListExitMaterialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
