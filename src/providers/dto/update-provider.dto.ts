import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
export class UpdateProviderDto extends PartialType(CreateProviderDto) {


    @IsString({message:'El nombre debe ser texto'})
  @MinLength(2,{message:'El nombre debe tener mas de 2 caracteres'}) 
  name:string;

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(12)
  nit:string;
}
