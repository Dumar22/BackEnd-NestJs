import { PartialType } from '@nestjs/mapped-types';
import { CreateToolAssignmentDetailsDto, CreateToolAssignmentDto } from './create-tool-assignment.dto';
import {  IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ToolAssignmentDetails } from '../entities';


export class UpdateToolAsignamentDto extends PartialType(CreateToolAssignmentDto) {
    
    @IsString()
    id?: string;

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

export class UpdateToolAssignmentDetailsDto extends PartialType(CreateToolAssignmentDetailsDto) {


    @IsString()
    id?: string;

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
  
 