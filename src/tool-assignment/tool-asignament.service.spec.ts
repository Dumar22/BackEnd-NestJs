import { Test, TestingModule } from '@nestjs/testing';
import { ToolAsignamentService } from './tool-assignment.service';

describe('ToolAsignamentService', () => {
  let service: ToolAsignamentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolAsignamentService],
    }).compile();

    service = module.get<ToolAsignamentService>(ToolAsignamentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
