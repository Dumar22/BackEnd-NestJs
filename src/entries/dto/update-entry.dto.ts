import { PartialType } from '@nestjs/mapped-types';
import { CreateEntryDto } from './create-entry.dto';
import { IsDate, IsString, MinLength, IsNotEmpty, Matches, IsOptional, IsArray } from 'class-validator';
import { DetailsEntry } from '../entities';

export class UpdateEntryDto extends PartialType(CreateEntryDto) {

    @IsDate()
    date: Date
         
    @IsString()
    @MinLength(2)
    origin: string

    @IsString()
    @MinLength(2)
    providerName: string

    @IsNotEmpty()
    @Matches(/^[0-9]{11}$/, { message: 'El número de nit debe tener 11 dígitos numéricos.' })
    providerNit: string

    @IsString()
    @IsOptional()
    observation?:string

    @IsArray()
    createDetailDto?: DetailsEntry[];
}
