import { Type } from "class-transformer";
import {IsOptional, IsString, IsDate, MinLength, IsNumber } from "class-validator";


export class CreateProyectDto {



    @IsString({message:'El nombre debe ser texto'})
  @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
  name:string;

  @IsDate()
  @Type(() => Date)
  initialize: Date

  @IsString()
  municipality: string;

  @IsString()
    address: string;

    @IsString()
    install: string;

    @IsOptional()
    @IsString()
    install2?: string;
    
    @IsOptional()
    @IsString()
    type: string;

    @IsOptional()
    @IsNumber()
    house?: number;

    @IsOptional()
    @IsNumber()
    apt?: number;

    @IsOptional()
    @IsString()
    tower?: string;

    @IsOptional()
    @IsNumber()
    floor?: number   

    @IsOptional()
    @IsString()
    modifications?: string 

    @IsOptional()
  @IsString()
  obs?:string;
}
