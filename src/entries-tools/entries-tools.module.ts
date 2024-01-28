import { Module } from '@nestjs/common';
import { EntriesToolsService } from './entries-tools.service';
import { EntriesToolsController } from './entries-tools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { ToolsModule } from 'src/tools/tools.module';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';
import { EntriesTool } from './entities/entries-tool.entity';
import { DetailsEntriesTools } from './entities/entries-tool-details.entity';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Module({
  controllers: [EntriesToolsController],
  providers: [EntriesToolsService, FileUploadService],
  imports: [
    TypeOrmModule.forFeature([EntriesTool,DetailsEntriesTools]),
    UsersModule,
    ToolsModule,
    UploadXlsModule
    
  ],
  exports:[TypeOrmModule]
})
export class EntriesToolsModule {}
