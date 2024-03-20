import { Module } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { EntriesController } from './entries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { DetailsEntry, Entry } from './entities';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';
import { ToolsModule } from 'src/tools/tools.module';



@Module({
  controllers: [EntriesController],
  providers: [EntriesService,FileUploadService],
  imports: [
    TypeOrmModule.forFeature([Entry,DetailsEntry]),
    UsersModule,
    MaterialsModule,
    ToolsModule,
    MetersModule,
    UploadXlsModule
    
  ],
  exports:[TypeOrmModule]
})
export class EntriesModule {}
