import { Type } from "class-transformer";
import { IsDate, IsString, MinLength, IsOptional, IsUUID, IsArray } from "class-validator";
import { ExtiMaterialsAditionalsDetailsService } from "../entities";

export class CreateExtiMaterialsAditionalsServiceDto {

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
   details:ExtiMaterialsAditionalsDetailsService[];
}
