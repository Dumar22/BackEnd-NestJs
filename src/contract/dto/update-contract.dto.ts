import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { IsString, MinLength,  IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContractDto extends PartialType(CreateContractDto) {


    @IsString()
    @MinLength(2)
    contract:string

    @IsString()
    @MinLength(2)
    name:string

    @IsOptional()
    contractNumber?:number;

    @IsString()
    @IsOptional()
    ot:string

    @IsString()
    @MinLength(2)
    addres:string

    @IsString()
    @MinLength(2)
    request:string

    @IsNotEmpty()   
    phone:string

    @IsString()
    @MinLength(2)
    municipality: string;

    @IsString()
    @MinLength(2)
    neighborhood: string;

    @IsDate()
    @Type(() => Date)
    date: Date;

    @IsDate()
    @Type(() => Date)
    dateFinalization: Date;


    @IsString()
    @IsOptional()
    observation?:string

    @IsOptional()
    @IsString()
    status: string;
}
