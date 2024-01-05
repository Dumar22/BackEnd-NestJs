import { PartialType } from '@nestjs/mapped-types';
import { CreateExitMaterialDto } from './create-exit-material.dto';

export class UpdateExitMaterialDto extends PartialType(CreateExitMaterialDto) {}
