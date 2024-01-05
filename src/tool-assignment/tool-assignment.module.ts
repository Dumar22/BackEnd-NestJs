import { Module } from '@nestjs/common';

import { ToolAsignamentController } from './tool-assignment.controller';
import { ToolAssignment } from './entities/tool-assignment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { CollaboratorsModule } from 'src/collaborators/collaborators.module';
import { ToolsModule } from 'src/tools/tools.module';
import { ToolAssignmentService } from './tool-assignment.service';
import { ToolAssignmentDetail } from './entities/details-tool-assignment.entity';

@Module({
  controllers: [ToolAsignamentController],
  providers: [ToolAssignmentService],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([ToolAssignment, ToolAssignmentDetail]),
    MaterialsModule,
    MetersModule,
    CollaboratorsModule,
    ToolsModule
    
  ],
  exports:[TypeOrmModule]
})
export class ToolAsignamentModule {}
