import { Module } from '@nestjs/common';
import{ ConfigModule} from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsModule } from './materials/materials.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './auth/users.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ToolsModule } from './tools/tools.module';
import { MetersModule } from './meters/meters.module';
import { ProvidersModule } from './providers/providers.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { ContractModule } from './contract/contract.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { EntriesModule } from './entries/entries.module';
import { TransfersModule } from './transfers/transfers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ToolAsignamentModule } from './tool-assignment/tool-assignment.module';
import { AssignmentMaterialsVehicleModule } from './assignment-materials-vehicle/assignment-materials-vehicle.module';
import { ExitMaterialsModule } from './exit-materials/exit-materials.module';
import { FileUploadService } from './upload-xls/upload-xls.service';
import { UploadXlsModule } from './upload-xls/upload-xls.module';
import { ProyectsModule } from './proyects/proyects.module';
import { AssingMaterialsProyectModule } from './assing-materials-proyect/assing-materials-proyect.module';
import { EntriesToolsModule } from './entries-tools/entries-tools.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      //timezone: 'Z',
      autoLoadEntities: true,
      synchronize:false, // use synchronize for development
    }),
    MaterialsModule,
    CommonModule,
    UsersModule,
    WarehousesModule,
    ToolsModule,
    MetersModule,
    ProvidersModule,
    CollaboratorsModule,
    ContractModule,
    VehiclesModule,
    EntriesModule,
    TransfersModule,
    NotificationsModule,
    ToolAsignamentModule,
    AssignmentMaterialsVehicleModule,
    ExitMaterialsModule,
    UploadXlsModule,
    ProyectsModule,
    AssingMaterialsProyectModule,
    EntriesToolsModule,
  ],
  controllers: [],
  providers: [FileUploadService],
})
export class AppModule {}
