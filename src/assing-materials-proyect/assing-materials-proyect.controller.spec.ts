import { Test, TestingModule } from '@nestjs/testing';
import { AssingMaterialsProyectController } from './assing-materials-proyect.controller';
import { AssingMaterialsProyectService } from './assing-materials-proyect.service';

describe('AssingMaterialsProyectController', () => {
  let controller: AssingMaterialsProyectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssingMaterialsProyectController],
      providers: [AssingMaterialsProyectService],
    }).compile();

    controller = module.get<AssingMaterialsProyectController>(AssingMaterialsProyectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
