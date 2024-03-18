import { PartialType } from '@nestjs/mapped-types';
import { CreateToolDto } from './create-tool.dto';
import { IsBoolean, IsIn,  IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class UpdateToolDto extends PartialType(CreateToolDto) {

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
    iva:number;

    @IsNumber()
    total_iva:number;
  
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?:number;
  
    @IsNumber()
    @IsPositive()
    price:number;
  
    @IsBoolean()
    @IsOptional()
    available?:boolean;
  
    @IsString()
    @IsOptional()
    observation?:string;



}
