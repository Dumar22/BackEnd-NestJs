import { Test, TestingModule } from '@nestjs/testing';
import { AssingMaterialsProyectService } from './assing-materials-proyect.service';

describe('AssingMaterialsProyectService', () => {
  let service: AssingMaterialsProyectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssingMaterialsProyectService],
    }).compile();

    service = module.get<AssingMaterialsProyectService>(AssingMaterialsProyectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
