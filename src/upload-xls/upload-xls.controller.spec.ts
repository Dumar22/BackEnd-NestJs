import { Test, TestingModule } from '@nestjs/testing';
import { UploadXlsController } from './upload-xls.controller';
import { UploadXlsService } from './upload-xls.service';

describe('UploadXlsController', () => {
  let controller: UploadXlsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadXlsController],
      providers: [UploadXlsService],
    }).compile();

    controller = module.get<UploadXlsController>(UploadXlsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
