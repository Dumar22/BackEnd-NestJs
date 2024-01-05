import { Type } from "class-transformer";
import { IsString, IsUUID, IsNumber, IsPositive, IsOptional, IsDate, IsBoolean } from "class-validator";


export class CreateAssingMaterialsDetailsProyectDto {

    @IsString() 
    @IsUUID()
    materialId: string;
  
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
    returnedA?: Date;
  
    @IsBoolean()
    returnMaterials?: boolean;
  }

