import { Module } from '@nestjs/common';
import { AssignmentMaterialsVehicleService } from './assignment-materials-vehicle.service';
import { AssignmentMaterialsVehicleController } from './assignment-materials-vehicle.controller';
import { AssignmentDetailsMaterialsVehicle, AssignmentMaterialsVehicle } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { CollaboratorsModule } from 'src/collaborators/collaborators.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';

@Module({
  controllers: [AssignmentMaterialsVehicleController],
  providers: [AssignmentMaterialsVehicleService],
  imports: [  
  UsersModule,
  TypeOrmModule.forFeature([AssignmentMaterialsVehicle, AssignmentDetailsMaterialsVehicle]),
  MaterialsModule,
  MetersModule,
  CollaboratorsModule,
  VehiclesModule

  ],
  exports:[TypeOrmModule]
})
export class AssignmentMaterialsVehicleModule {}
