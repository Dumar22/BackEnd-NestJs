import { Type } from "class-transformer"
import { IsString, MinLength, IsNumber, IsPositive, IsNotEmpty, Matches, IsOptional, IsDate } from "class-validator"

export class CreateContractDto {
    
    @IsString()
    @MinLength(2)
    contract:string;

    @IsString()
    @MinLength(2)
    name:string;

    @IsString()
    @IsOptional()
    ot:string;

    @IsString()
    @MinLength(2)
    addres:string;

    @IsString()
    @MinLength(2)
    request:string;

    @IsNotEmpty()   
    phone:string;

    @IsString()
    @MinLength(2)
    municipality: string;

    @IsString()
    @MinLength(2)
    neighborhood: string;

    @IsString()
   // @Type(() => Date)
    date: string;

    @IsOptional()
    @IsString()
    status: string;



//     @IsNotEmpty()
// //@Matches(/^[0-9]{11}$/, { message: 'El número de teléfono debe tener 10 dígitos numéricos.' })
//     phone:string

    @IsString()
    @IsOptional()
    observation?:string
}
