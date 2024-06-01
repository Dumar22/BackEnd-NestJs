import { Module } from '@nestjs/common';
import { ExtiMaterialsAditionalsServicesService } from './exti-materials-aditionals-services.service';
import { ExtiMaterialsAditionalsServicesController } from './exti-materials-aditionals-services.controller';

@Module({
  controllers: [ExtiMaterialsAditionalsServicesController],
  providers: [ExtiMaterialsAditionalsServicesService],
})
export class ExtiMaterialsAditionalsServicesModule {}
