import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentMaterialsVehicleDto } from './create-assignment-materials-vehicle.dto';

export class UpdateAssignmentMaterialsVehicleDto extends PartialType(CreateAssignmentMaterialsVehicleDto) {}
