import { Test, TestingModule } from '@nestjs/testing';
import { ExitMaterialsService } from './exit-materials.service';

describe('ExitMaterialsService', () => {
  let service: ExitMaterialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExitMaterialsService],
    }).compile();

    service = module.get<ExitMaterialsService>(ExitMaterialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
