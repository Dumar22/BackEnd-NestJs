import { IsString, MinLength, IsNumber, IsPositive, IsNotEmpty, Matches, IsOptional } from "class-validator"

export class CreateContractDto {
    
    @IsString()
    @MinLength(2)
    contract:string

    @IsString()
    @MinLength(2)
    name:string

    @IsString()
    ot:string

    @IsString()
    @MinLength(2)
    addres:string

    @IsString()
    @MinLength(2)
    request:string

    
    @IsNotEmpty()
//@Matches(/^[0-9]{11}$/, { message: 'El número de teléfono debe tener 10 dígitos numéricos.' })
    phone:string

    @IsString()
    @IsOptional()
    observation?:string
}
