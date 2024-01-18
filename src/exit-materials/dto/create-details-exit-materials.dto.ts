import { Type } from "class-transformer";
import { IsString, IsUUID, IsNumber, IsPositive, IsOptional, IsDate } from "class-validator";


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

    @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
    @IsPositive({ each: true, message: 'Restore must be a positive number' })
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
  

  }
