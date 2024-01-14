import { Type } from "class-transformer"
import { IsArray, IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, MaxLength, MinLength } from "class-validator"
import { DetailsEntry } from "../entities"

export class CreateEntryDto {

    @IsDate()
    @Type(() => Date)
    date: Date

    @IsString()
    @MinLength(2)
    entryNumber : string
     
    @IsString()
    @MinLength(2)
    origin: string

    @IsString()
    @MinLength(2)
    providerName: string

    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(13)
    // @Matches(/^[0-9]{11}$/, { message: 'El número de nit debe tener 11 dígitos numéricos.' })
    providerNit: string

    @IsString()
    @IsOptional()
    observation?:string

    @IsArray()
    @IsOptional()
    createDetailDto?: DetailsEntry[];

}
