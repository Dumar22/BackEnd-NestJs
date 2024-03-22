import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {

    @IsString()
fullName: string;

@IsString()
user:string


@IsString()
//@MinLength(6)
@MaxLength(20)
//@Matches(/(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*$/, {
    //message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
//})
@IsOptional()
password?: string;


@IsOptional()
@IsArray()
warehouseIds: string[];

@IsOptional()
isActive?: boolean;

@IsArray()
rol:string[]
}
