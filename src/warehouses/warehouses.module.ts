import { Module } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { UsersModule } from 'src/auth/users.module';

@Module({
  controllers: [WarehousesController],
  providers: [WarehousesService],
  imports:[
    TypeOrmModule.forFeature([Warehouse]),
    
     ],
  exports: [TypeOrmModule]
})
export class WarehousesModule {}
