import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { IsString, MinLength,  IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContractDto extends PartialType(CreateContractDto) {


    @IsString()
    @IsOptional()
     id?: string;
}
