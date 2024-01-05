import { Type } from "class-transformer";
import { IsDate, IsString, MinLength, IsOptional, IsUUID, IsArray } from "class-validator";
import { DetailsExitMaterials } from "../entities";


export class CreateExitMaterialDto {

    @IsDate()
    @Type(() => Date)
    date: Date;
    
    @IsString()
    @MinLength(2)
    type: string;
  
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

