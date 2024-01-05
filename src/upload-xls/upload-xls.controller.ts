import { Controller } from '@nestjs/common';
import { FileUploadService } from './upload-xls.service';

@Controller('upload-xls')
export class UploadXlsController {
  constructor(private readonly uploadXlsService: FileUploadService) {}
}
