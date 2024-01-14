import { PartialType } from '@nestjs/mapped-types';
import { CreateExitMaterialDto } from './create-exit-material.dto';
import { Type } from 'class-transformer';
import { IsString, IsUUID, IsNumber, IsPositive, IsOptional, IsDate, IsBoolean, MinLength, IsArray } from 'class-validator';
import { DetailsExitMaterials } from '../entities';

export class UpdateExitMaterialDto extends PartialType(CreateExitMaterialDto) {

    @IsDate()
    @Type(() => Date)
    date: Date;
    
    @IsString()
    @MinLength(2)
    type: string;

    @IsString()
   state: string;
  
    @IsString()
    @IsOptional()
    observation?: string;
  
    @IsString() 
    @IsUUID()
    collaboratorId: string;

    @IsString() 
    @IsUUID()
    contractId: string;    
    
   @IsArray()  
   details:DetailsExitMaterials[];

}
