

import { IsArray, IsDate,   IsOptional,  IsString,  IsUUID, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ToolAssignmentDetail } from '../entities';


export class CreateToolAssignmentDto {
    
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
 details:ToolAssignmentDetail[];
  
}
