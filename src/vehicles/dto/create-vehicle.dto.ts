import { IsBoolean, IsIn, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreateVehicleDto {
  
  @IsString({message:'El nombre debe ser texto'})
  @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
  make:string;

  @IsString()
  @MinLength(2)
  @MaxLength(6)
  plate:string;

  @IsString()
  @MinLength(2)
  @MaxLength(5)
  model:string;
 
  @IsBoolean()
  status:boolean;

  @IsString()
  @IsOptional()
  observation?:string;

  
}
