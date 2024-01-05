import { IsNotEmpty, IsNumber, IsPositive, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateProviderDto {
  
  @IsString({message:'El nombre debe ser texto'})
  @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
  name:string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(12)
  // @Matches(/^[0-9]{11}$/, { message: 'El número de nit debe tener 11 dígitos numéricos.' })
  nit:string;
    
}
