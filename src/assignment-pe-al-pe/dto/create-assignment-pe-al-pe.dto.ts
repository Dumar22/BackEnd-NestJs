import { Type } from "class-transformer";
import { IsDate, IsString, MinLength, IsOptional, IsUUID, IsArray, IsNumber, IsPositive, IsBoolean } from "class-validator";
import { AssignmentDetails } from "../entities/details-assignment-pe-al-pe.entity";

export class CreateAssignmentPeAlPeDto {

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
    
   @IsArray()  
   details:AssignmentDetails[];
}


export class AssignmentPealPeDetailsDto {

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