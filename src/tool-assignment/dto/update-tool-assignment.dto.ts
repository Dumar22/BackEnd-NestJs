import { PartialType } from '@nestjs/mapped-types';
import { CreateToolAssignmentDto } from './create-tool-assignment.dto';
import {  IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateToolAsignamentDto extends PartialType(CreateToolAssignmentDto) {
    @IsString()
    @IsOptional()    
    id?:string;
    
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
  
    @IsBoolean()
    returnTools?: boolean;


}
 