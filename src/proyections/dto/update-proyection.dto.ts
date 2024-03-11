import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailsProyectionDto, CreateProyectionDto } from './create-proyection.dto';
import { IsArray, IsString, IsUUID } from 'class-validator';
import { DetailsProyection } from '../entities/details-proyection.entity';

export class UpdateProyectionDto extends PartialType(CreateProyectionDto) {
    @IsString() 
    @IsUUID()
    pryectId: string;

    @IsArray()  
   details:DetailsProyection[];
}

export class UpdateDetailsProyectionDto extends PartialType(CreateDetailsProyectionDto ) {}
