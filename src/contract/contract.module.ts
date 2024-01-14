import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { UsersModule } from 'src/auth/users.module';
import { FileUploadService } from 'src/upload-xls/upload-xls.service';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';

@Module({
  controllers: [ContractController],
  providers: [ContractService, FileUploadService],
  imports: [
    TypeOrmModule.forFeature([Contract]),
    UsersModule,
    UploadXlsModule
    
  ],
  exports:[TypeOrmModule]
})
export class ContractModule {}
