import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  
  @IsString({message:'La marca debe ser texto'})
  @MinLength(2,{message:'La marca debe tener mas de 2 caracteres'}) 
  make:string;

  @IsString()
  @MinLength(2)
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