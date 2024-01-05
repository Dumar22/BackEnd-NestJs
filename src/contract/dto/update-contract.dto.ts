import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { IsString, MinLength,  IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateContractDto extends PartialType(CreateContractDto) {


    @IsString()
    @MinLength(2)
    registration:string

    @IsString()
    @MinLength(2)
    name:string

    @IsString()
    ot:string

    @IsString()
    @MinLength(2)
    addres:string

    @IsNotEmpty()   
    phone:string

    @IsString()
    @IsOptional()
    observation?:string
}
