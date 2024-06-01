import { PartialType } from '@nestjs/mapped-types';
import { CreateExtiMaterialsAditionalsServiceDto } from './create-exti-materials-aditionals-service.dto';

export class UpdateExtiMaterialsAditionalsServiceDto extends PartialType(CreateExtiMaterialsAditionalsServiceDto) {}
