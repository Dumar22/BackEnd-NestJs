import { Test, TestingModule } from '@nestjs/testing';
import { EntriesToolsService } from './entries-tools.service';

describe('EntriesToolsService', () => {
  let service: EntriesToolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntriesToolsService],
    }).compile();

    service = module.get<EntriesToolsService>(EntriesToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
