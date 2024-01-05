import { Module } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CollaboratorsController } from './collaborators.controller';
import { Collaborator } from './entities/collaborator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Module({
  controllers: [CollaboratorsController],
  providers: [CollaboratorsService, FileUploadService],
  imports: [
    TypeOrmModule.forFeature([Collaborator]),
    UsersModule,
    UploadXlsModule
  ],
  exports:[TypeOrmModule]
})
export class CollaboratorsModule {}
