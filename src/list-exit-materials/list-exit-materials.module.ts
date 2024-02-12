import { Module } from '@nestjs/common';
import { ListExitMaterialsService } from './list-exit-materials.service';
import { ListExitMaterialsController } from './list-exit-materials.controller';
import { ListExitMaterial } from './entities/list-exit-material.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/auth/users.module';
import { UploadXlsModule } from 'src/upload-xls/upload-xls.module';
import { MaterialsModule } from 'src/materials/materials.module';
import { DetailsListMaterials } from './entities/details-list-material.entity';

@Module({
  controllers: [ListExitMaterialsController],
  providers: [ListExitMaterialsService],
  imports: [
    TypeOrmModule.forFeature([ListExitMaterial,DetailsListMaterials]),
    UsersModule,
    MaterialsModule,
    UploadXlsModule
    
  ],
  exports:[TypeOrmModule]
})
export class ListExitMaterialsModule {}
