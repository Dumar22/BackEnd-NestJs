import { Module } from '@nestjs/common';
import { ProyectionsService } from './proyections.service';
import { ProyectionsController } from './proyections.controller';
import { UsersModule } from 'src/auth/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetersModule } from 'src/meters/meters.module';
import { CollaboratorsModule } from 'src/collaborators/collaborators.module';

@Module({
  controllers: [ProyectionsController],
  providers: [ProyectionsService],
  imports: [  
    UsersModule,
    TypeOrmModule.forFeature([]),
    //MaterialsModule
    //MetersModule,
    CollaboratorsModule,
    //ContractModule,
    //AssignmentPeAlPeModule

  
    ],
    exports:[TypeOrmModule]
})
export class ProyectionsModule {}
