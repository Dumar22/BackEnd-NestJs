import { IsBoolean, IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";


export class CreateToolDto {

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
    quantity:number;
  
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
