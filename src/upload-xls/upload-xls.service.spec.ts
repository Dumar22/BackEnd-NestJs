import { Test, TestingModule } from '@nestjs/testing';
import { UploadXlsService } from './upload-xls.service';

describe('UploadXlsService', () => {
  let service: UploadXlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadXlsService],
    }).compile();

    service = module.get<UploadXlsService>(UploadXlsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
