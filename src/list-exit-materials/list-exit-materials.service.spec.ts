import { Test, TestingModule } from '@nestjs/testing';
import { ListExitMaterialsService } from './list-exit-materials.service';

describe('ListExitMaterialsService', () => {
  let service: ListExitMaterialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListExitMaterialsService],
    }).compile();

    service = module.get<ListExitMaterialsService>(ListExitMaterialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
