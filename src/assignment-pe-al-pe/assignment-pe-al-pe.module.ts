import { Module } from '@nestjs/common';
import { AssignmentPeAlPeService } from './assignment-pe-al-pe.service';
import { AssignmentPeAlPeController } from './assignment-pe-al-pe.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { CollaboratorsModule } from 'src/collaborators/collaborators.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { AssignmentPeAlPe } from './entities/assignment-pe-al-pe.entity';
import { AssignmentDetails } from './entities/details-assignment-pe-al-pe.entity';

@Module({
  controllers: [AssignmentPeAlPeController],
  providers: [AssignmentPeAlPeService],
  imports: [  
    UsersModule,
    TypeOrmModule.forFeature([AssignmentPeAlPe, AssignmentDetails ]),
    MaterialsModule,
    MetersModule,
    CollaboratorsModule,
    VehiclesModule
  
    ],
    exports:[TypeOrmModule]
})
export class AssignmentPeAlPeModule {
  
    
}
