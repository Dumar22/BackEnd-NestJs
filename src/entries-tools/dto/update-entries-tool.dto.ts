import { PartialType } from '@nestjs/mapped-types';
import { CreateEntriesToolDto } from './create-entries-tool.dto';
import { DetailsEntriesTools } from '../entities/entries-tool-details.entity';
import { IsDate, IsString, MinLength, IsNotEmpty, MaxLength, IsOptional, IsArray } from 'class-validator';

export class UpdateEntriesToolDto extends PartialType(CreateEntriesToolDto) {

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
    createDetailDto?: DetailsEntriesTools[];

}
