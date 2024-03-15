import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialDto } from './create-material.dto';
import { IsBoolean, IsIn,  IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {

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
    price:number;

    @IsNumber()
    @IsPositive()
    iva:number;
  
    @IsNumber()
    @IsPositive()
    total_iva:number;
  
    @IsBoolean()
    @IsOptional()
    available?:boolean;
  
    @IsString()
    @IsOptional()
    observation?:string;



}
