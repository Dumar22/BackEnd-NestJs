// file-upload.service.ts
import { Injectable } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { Repository } from 'typeorm';


@Injectable()
export class FileUploadService {

    async processExcel<T>(fileBuffer: Buffer, entityRepository: Repository<T>, dataFormat: (entry: any) => T) {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const entities: T[] = [];

    for (const entry of data) {
      const entity = dataFormat(entry);
      entities.push(entity);
    }

    //await entityRepository.save(entities);

    return entities;
  }

 
}

