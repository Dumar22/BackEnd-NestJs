
import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsString, IsUUID, IsNumber, IsPositive, IsOptional, IsDate, IsBoolean } from "class-validator";
import { CreateDetailExitMaterialsDto } from "./create-details-exit-materials.dto";


export class UpdateDetailExitMaterialsDto  extends PartialType(CreateDetailExitMaterialsDto) {

    @IsString()
    @IsOptional()
    id?: string;
  
    @IsString() 
    @IsUUID()
    materialId?: string;

    @IsString() 
    @IsUUID()
    meterId?: string;
  
    @IsNumber()
    @IsPositive()
    assignedQuantity: number;

    @IsNumber()
    @IsPositive()
    restore: number;

    @IsNumber()
    used?: number;
      
    @IsString()
    @IsOptional()
    observation?: string;
  
    
  }
