import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { Tool } from './entities/tool.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Module({
  controllers: [ToolsController],
  providers: [ToolsService, FileUploadService],
  imports: [
    TypeOrmModule.forFeature([Tool]),
    UsersModule,
    UploadXlsModule
  ],
  exports:[TypeOrmModule]
})
export class ToolsModule {}
