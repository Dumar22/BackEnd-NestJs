import { Module } from '@nestjs/common';
import { ProyectionsService } from './proyections.service';
import { ProyectionsController } from './proyections.controller';
import { UsersModule } from 'src/auth/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaboratorsModule } from 'src/collaborators/collaborators.module';
import { Proyection } from './entities/proyection.entity';
import { ProyectsModule } from 'src/proyects/proyects.module';
import { DetailsProyection } from './entities/details-proyection.entity';

@Module({
  controllers: [ProyectionsController],
  providers: [ProyectionsService],
  imports: [  
   
    TypeOrmModule.forFeature([Proyection, DetailsProyection]),
    //MaterialsModule
    //MetersModule,
    CollaboratorsModule,
    ProyectsModule,
    //ContractModule,
    //AssignmentPeAlPeModule
    UsersModule

  
    ],
    exports:[TypeOrmModule]
})
export class ProyectionsModule {}
