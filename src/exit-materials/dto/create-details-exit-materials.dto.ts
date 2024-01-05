import { Type } from "class-transformer";
import { IsString, IsUUID, IsNumber, IsPositive, IsOptional, IsDate, IsBoolean } from "class-validator";


export class CreateDetailExitMaterialsDto {

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
      
    @IsString()
    @IsOptional()
    observation?: string;
       
    @IsDate()
    @Type(() => Date)
    assignedAt: Date;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    returnedA?: Date;
  
    @IsBoolean()
    returnMaterials?: boolean;
  }
