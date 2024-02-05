

import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsString,  IsUUID, MinLength } from 'class-validator';
import { ToolAssignmentDetails } from '../entities';
import { Type } from 'class-transformer';


export class CreateToolAssignmentDto {
  
  @IsString()
  @MinLength(2)
  reason: string;

  @IsString() 
  @IsUUID()
  collaboratorId: string;

  @IsString()
  @IsOptional()
  observation?: string;
 
  @IsArray()  
   details:ToolAssignmentDetails[];
  
}

export class CreateToolAssignmentDetailsDto {

  @IsString() 
  @IsUUID()
  toolId?: string;

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
