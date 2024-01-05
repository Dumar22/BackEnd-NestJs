import { Module } from '@nestjs/common';
import { AssingMaterialsProyectService } from './assing-materials-proyect.service';
import { AssingMaterialsProyectController } from './assing-materials-proyect.controller';
import { AssingMaterialsProyect } from './entities/assing-materials-proyect.entity';
import { AssingMaterialsDetailsProyect } from './entities/assing-materials-details-proyect.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { MetersModule } from 'src/meters/meters.module';
import { ProyectsModule } from 'src/proyects/proyects.module';

@Module({
  controllers: [AssingMaterialsProyectController],
  providers: [AssingMaterialsProyectService],
  imports: [  
    UsersModule,
    TypeOrmModule.forFeature([AssingMaterialsProyect, AssingMaterialsDetailsProyect]),
    MaterialsModule,
    MetersModule,
    ProyectsModule,
    
  
    ],
    exports:[TypeOrmModule]
})
export class AssingMaterialsProyectModule {}
