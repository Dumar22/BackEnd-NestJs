import { Type } from "class-transformer";
import { IsDate, IsString, MinLength, IsOptional, IsUUID, IsArray } from "class-validator";
import { AssignmentDetailsMaterialsVehicle } from "../entities";

export class CreateAssignmentMaterialsVehicleDto {

    @IsDate()
    @Type(() => Date)
    date: Date;
    
    @IsString()
    @MinLength(2)
    reason: string;
  
    @IsString()
    @IsOptional()
    observation?: string;
  
    @IsString() 
    @IsUUID()
    collaboratorId: string;

    @IsString() 
    @IsUUID()
    vehicleId: string;
    
   @IsArray()  
   details:AssignmentDetailsMaterialsVehicle[];
}
