import { Test, TestingModule } from '@nestjs/testing';
import { EntriesToolsController } from './entries-tools.controller';
import { EntriesToolsService } from './entries-tools.service';

describe('EntriesToolsController', () => {
  let controller: EntriesToolsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntriesToolsController],
      providers: [EntriesToolsService],
    }).compile();

    controller = module.get<EntriesToolsController>(EntriesToolsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
