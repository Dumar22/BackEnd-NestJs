import { Test, TestingModule } from '@nestjs/testing';
import { ExtiMaterialsAditionalsServicesController } from './exti-materials-aditionals-services.controller';
import { ExtiMaterialsAditionalsServicesService } from './exti-materials-aditionals-services.service';

describe('ExtiMaterialsAditionalsServicesController', () => {
  let controller: ExtiMaterialsAditionalsServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtiMaterialsAditionalsServicesController],
      providers: [ExtiMaterialsAditionalsServicesService],
    }).compile();

    controller = module.get<ExtiMaterialsAditionalsServicesController>(ExtiMaterialsAditionalsServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
