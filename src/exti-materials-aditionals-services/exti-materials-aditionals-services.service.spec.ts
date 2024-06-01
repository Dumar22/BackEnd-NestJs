import { Test, TestingModule } from '@nestjs/testing';
import { ExtiMaterialsAditionalsServicesService } from './exti-materials-aditionals-services.service';

describe('ExtiMaterialsAditionalsServicesService', () => {
  let service: ExtiMaterialsAditionalsServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtiMaterialsAditionalsServicesService],
    }).compile();

    service = module.get<ExtiMaterialsAditionalsServicesService>(ExtiMaterialsAditionalsServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
