import { Module } from '@nestjs/common';
import { FileUploadService } from './upload-xls.service';
import { UploadXlsController } from './upload-xls.controller';
import { MetersModule } from 'src/meters/meters.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersService } from 'src/meters/meters.service';


@Module({
  controllers: [UploadXlsController],
  providers: [FileUploadService ],
  exports : [
    
    UploadXlsModule,
   
  ],
 
  
})
export class UploadXlsModule {}
