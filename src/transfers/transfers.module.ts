import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersService } from './transfers.service';
import { UsersModule } from 'src/auth/users.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { TransfersController } from './transfers.controller';
import { DetailsTransfer, Transfer } from './entities';

@Module({
  controllers: [TransfersController],
  providers: [TransfersService],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Transfer,DetailsTransfer]),
    MaterialsModule,
    MetersModule
    
  ],
  exports:[TypeOrmModule]
})
export class TransfersModule {}
