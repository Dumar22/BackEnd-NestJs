
import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDetailsMaterialsVehicleDto } from './create-assignment-details-materials-vehicle.dto';
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsNumber, IsPositive, IsOptional, IsDate, IsBoolean } from 'class-validator';

export class UpdateAssignmentDetailsMaterialsVehicleDto extends PartialType(CreateAssignmentDetailsMaterialsVehicleDto) {

    
    @IsOptional()
    @IsString() 
    @IsUUID()
    materialId?: string;
  
    @IsNumber()
    @IsPositive()
    assignedQuantity: number;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    returnedA?: Date;
  
    @IsBoolean()
    returnMaterials?: boolean;
}