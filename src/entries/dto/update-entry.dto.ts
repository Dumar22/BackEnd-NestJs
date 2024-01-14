import { PartialType } from '@nestjs/mapped-types';
import { CreateEntryDto } from './create-entry.dto';
import { IsDate, IsString, MinLength, IsNotEmpty, Matches, IsOptional, IsArray, MaxLength } from 'class-validator';
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
    @MinLength(2)
    @MaxLength(13)
    providerNit: string

    @IsString()
    @IsOptional()
    observation?:string

    @IsArray()
    @IsOptional()
    createDetailDto?: DetailsEntry[];
}
