import { Type } from "class-transformer";
import { IsString, IsUUID, IsNumber, IsPositive, IsOptional, IsDate, IsBoolean } from "class-validator";


export class CreateAssignmentDetailsMaterialsVehicleDto {

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


