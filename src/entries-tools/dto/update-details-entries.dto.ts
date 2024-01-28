import { PartialType } from "@nestjs/mapped-types";
import { IsBoolean, IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";
import { CreateDetailDto } from "./create-details-entries.dto";


export class UpdateDetailToolDto extends PartialType(CreateDetailDto) {


    @IsString()
    @IsOptional()    
    id?:string;

    @IsString({message:'El nombre debe ser texto'})
    @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
    name:string;
  
    @IsString()
    @MinLength(2)
    code:string;

    @IsString()
    @IsOptional()
    @MinLength(2)
    serial?:string;
    
    @IsString()
    @IsOptional()
    @MinLength(2)
    brand?:string;
  
    // @IsIn(['UNIDAD','METRO', 'METRO 3', 'KILO']) 
    @IsString()
    unity:string;
  
    @IsNumber()
    @IsPositive()
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
