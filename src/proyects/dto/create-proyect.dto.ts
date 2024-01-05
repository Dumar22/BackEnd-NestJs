import { Type } from "class-transformer";
import {IsOptional, IsString, IsDate, MinLength } from "class-validator";


export class CreateProyectDto {



    @IsString({message:'El nombre debe ser texto'})
  @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
  name:string;

  @IsDate()
  @Type(() => Date)
  initialize: Date

  @IsString({message:'El nombre debe ser texto'})
  @IsOptional()
  obs?:string;
}
