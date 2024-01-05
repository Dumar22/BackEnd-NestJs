import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';

@Module({
  controllers: [ProvidersController],
  providers: [ProvidersService, FileUploadService],
  imports: [
    TypeOrmModule.forFeature([Provider]),
    UsersModule,
    UploadXlsModule
    
  ],
  exports:[TypeOrmModule]
})
export class ProvidersModule {}
