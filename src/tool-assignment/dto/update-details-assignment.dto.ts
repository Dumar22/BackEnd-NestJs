import { PartialType } from '@nestjs/mapped-types';
import { CreateToolAssignmentDetailDto } from './details-tool-assignment.dto';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateToolAssignmentDetailDto extends PartialType(CreateToolAssignmentDetailDto) {
    @IsString()
    @IsOptional()
    id?:string

    @IsString() 
    @IsUUID()
    toolId: string;
  
    @IsNumber()
    @IsPositive()
    assignedQuantity: number;
    
    @IsString()
    @IsOptional()
    observation?: string;
  
    @IsString()
    @IsOptional()
    event: string;
   
    @IsDate()
    @Type(() => Date)
    assignedAt: Date;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    returnedA?: Date;
  
    @IsBoolean()
    returnTools?: boolean;
}