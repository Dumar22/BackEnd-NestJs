import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { Material } from './entities/material.entity';
import { UsersModule } from 'src/auth/users.module';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';

@Module({
  controllers: [MaterialsController],
  providers: [MaterialsService, FileUploadService],
  imports: [
    TypeOrmModule.forFeature([Material]),
    UsersModule,
    UploadXlsModule
    
  ],
  exports:[TypeOrmModule]
})
export class MaterialsModule {}
