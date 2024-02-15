import { Module } from '@nestjs/common';
import { ExitMaterialsService } from './exit-materials.service';
import { ExitMaterialsController } from './exit-materials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { CollaboratorsModule } from 'src/collaborators/collaborators.module';
import { ContractModule } from 'src/contract/contract.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { DetailsExitMaterials, ExitMaterial } from './entities';
import { AssignmentPeAlPeModule } from 'src/assignment-pe-al-pe/assignment-pe-al-pe.module';

@Module({
  controllers: [ExitMaterialsController],
  providers: [ExitMaterialsService],
  imports: [  
    UsersModule,
    TypeOrmModule.forFeature([ExitMaterial, DetailsExitMaterials]),
    MaterialsModule,
    MetersModule,
    CollaboratorsModule,
    ContractModule,
    AssignmentPeAlPeModule

  
    ],
    exports:[TypeOrmModule]
})
export class ExitMaterialsModule {}
