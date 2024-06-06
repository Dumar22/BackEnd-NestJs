import { Module } from '@nestjs/common';
import { ExtiMaterialsAditionalsServicesService } from './exti-materials-aditionals-services.service';
import { ExtiMaterialsAditionalsServicesController } from './exti-materials-aditionals-services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentPeAlPeModule } from 'src/assignment-pe-al-pe/assignment-pe-al-pe.module';
import { UsersModule } from 'src/auth/users.module';
import { CollaboratorsModule } from 'src/collaborators/collaborators.module';
import { ContractModule } from 'src/contract/contract.module';

import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { ExtiMaterialsAditionalsDetailsService, ExtiMaterialsAditionalsService } from './entities';

@Module({
  controllers: [ExtiMaterialsAditionalsServicesController],
  providers: [ExtiMaterialsAditionalsServicesService],
  imports: [  
    UsersModule,
    TypeOrmModule.forFeature([ExtiMaterialsAditionalsService,ExtiMaterialsAditionalsDetailsService]),
    MaterialsModule,
    MetersModule,
    CollaboratorsModule,
    ContractModule,
    AssignmentPeAlPeModule

  
    ],
    exports:[TypeOrmModule]
})
export class ExtiMaterialsAditionalsServicesModule {}
