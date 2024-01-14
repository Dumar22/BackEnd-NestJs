import { Module } from '@nestjs/common';
import { MetersService } from './meters.service';
import { MetersController } from './meters.controller';
import { Meter } from './entities/meter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';

@Module({
  controllers: [MetersController],
  providers: [MetersService, FileUploadService],
  imports: [
    TypeOrmModule.forFeature([Meter]),
    UsersModule,
    UploadXlsModule
  ],
  exports:[TypeOrmModule]
})
export class MetersModule {}
