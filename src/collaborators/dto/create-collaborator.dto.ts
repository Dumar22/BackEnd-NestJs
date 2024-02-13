import { IsBoolean, IsEmail, IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateCollaboratorDto {
  
  @IsString({message:'El nombre debe ser texto'})
  @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
  name:string;

  @IsString()
  @MinLength(2)
  code:string;

  //@IsIn(['UNIDAD','METRO', 'METRO 3', 'KILO'])
  @IsString()
  @MinLength(2)
  operation:string;

  @IsString()
  @MinLength(6)
  document:string;

  @IsString()
  @MinLength(6)
  phone:string;
 
  @IsEmail()
  @IsOptional()
  mail?:string;

  @IsBoolean()
  @IsOptional()
  status?:boolean;
  
}

