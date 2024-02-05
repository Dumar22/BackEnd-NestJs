import { IsBoolean, IsIn, IsNumber, IsOptional, IsPositive, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateVehicleDto {
  
  @IsString({message:'El nombre debe ser texto'})
  @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
  make:string;

  @IsString()
  @Matches(/^[A-Za-z]{3}\d{3}$/, { message: 'El formato debe ser 3 letras seguidas de 3 números, por ejemplo BFC435' })
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
