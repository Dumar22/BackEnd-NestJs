

import { IsBoolean, IsDate,   IsNumber,   IsOptional,  IsPositive,  IsString,  IsUUID, MinLength } from 'class-validator';
import { Type } from 'class-transformer';


export class CreateToolAssignmentDto {
  
  @IsString()
  @MinLength(2)
  reason: string;

  @IsString() 
  @IsUUID()
  collaboratorId: string;
  
  @IsString() 
  @IsUUID()
  toolId: string;

  @IsNumber()
  @IsPositive()
  assignedQuantity: number;

  @IsString()
  @IsOptional()
  observation?: string;
 
  @IsDate()
  @Type(() => Date)
  assignedAt: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  returnedAt?: Date;

  
}
