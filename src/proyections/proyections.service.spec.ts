import { Test, TestingModule } from '@nestjs/testing';
import { ProyectionsService } from './proyections.service';

describe('ProyectionsService', () => {
  let service: ProyectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProyectionsService],
    }).compile();

    service = module.get<ProyectionsService>(ProyectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
