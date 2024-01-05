import { Type } from "class-transformer";
import { IsDate, IsString, IsOptional, IsUUID, IsArray } from "class-validator";
import { AssingMaterialsDetailsProyect } from "../entities/assing-materials-details-proyect.entity";

export class CreateAssingMaterialsProyectDto {

    @IsDate()
    @Type(() => Date)
    date: Date;    
    
    @IsString()
    @IsOptional()
    observation?: string;  
    
    @IsString() 
    @IsUUID()
    proyectId: string;
    
   @IsArray()  
   details:AssingMaterialsDetailsProyect[];
}
