import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService],
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    UsersModule,
    
  ],
  exports:[TypeOrmModule]
})
export class VehiclesModule {}
