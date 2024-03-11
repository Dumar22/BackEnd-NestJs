import { IsArray, IsBoolean, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MinLength } from "class-validator";
import { DetailsProyection } from "../entities/details-proyection.entity";

export class CreateProyectionDto {

    @IsString() 
    @IsUUID()
    pryectId: string;

    @IsArray()  
   details:DetailsProyection[];
}


export class CreateDetailsProyectionDto {

    @IsString({message:'El nombre debe ser texto'})
    @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
    name:string;
  
    @IsString()
    @MinLength(2)
    code:string;

    // @IsIn(['UNIDAD','METRO', 'METRO 3', 'KILO']) 
    @IsString()
    unity:string;
  
    @IsNumber()
    @IsPositive()
    quantity:number;
  
    @IsNumber()
    @IsPositive()
    quantity_variable:number;

    @IsNumber()
    @IsPositive()
    balance:number;

    @IsNumber()
    @IsPositive()
    total:number;
  
}
