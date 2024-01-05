import { PartialType } from '@nestjs/mapped-types';
import { CreateToolAssignmentDto } from './create-tool-assignment.dto';
import {  IsArray, IsDate, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ToolAssignmentDetail } from '../entities';


export class UpdateToolAsignamentDto extends PartialType(CreateToolAssignmentDto) {
    @IsString()
    @IsOptional()    
    id?:string;

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
 